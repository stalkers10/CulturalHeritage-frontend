import { Component, inject, OnInit } from '@angular/core';
import { finalize, forkJoin } from 'rxjs';
import { ApiService, EventReminder, HeritageEvent } from '../services/api.service';
import { EventNotificationService } from '../services/event-notification.service';

@Component({
  selector: 'app-events',
  templateUrl: './events.page.html',
  styleUrls: ['./events.page.scss'],
  standalone: false,
})
export class EventsPage implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly eventNotificationService = inject(EventNotificationService);

  events: HeritageEvent[] = [];
  reminders: EventReminder[] = [];
  selectedReminderOffsets: Record<number, number> = {};
  savingReminderIds: Record<number, boolean> = {};
  eventForm = this.createEmptyEventForm();
  isLoading = false;
  isSubmittingEvent = false;
  errorMessage = '';
  searchTerm = '';
  selectedCategory = 'all';

  readonly reminderOptions = [
    { label: 'At event time', minutes: 0 },
    { label: '30 minutes before', minutes: 30 },
    { label: '1 hour before', minutes: 60 },
    { label: '1 day before', minutes: 1440 }
  ];

  ngOnInit(): void {
    this.loadEvents();
  }

  ionViewWillEnter(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      eventsResponse: this.apiService.getEvents(),
      remindersResponse: this.apiService.getEventReminders()
    }).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: ({ eventsResponse, remindersResponse }) => {
        this.events = eventsResponse.events || [];
        this.reminders = remindersResponse.reminders || [];
        this.prepareReminderOffsets();
      },
      error: (err) => {
        console.error('Failed to load events', err);
        this.errorMessage = this.apiService.formatHttpError(err, 'Failed to load events');
      }
    });
  }

  get featuredEvent(): HeritageEvent | undefined {
    return this.events.find((event) => event.isFeatured) || this.events[0];
  }

  get categories(): string[] {
    return Array.from(new Set(this.events.map((event) => event.category).filter(Boolean)));
  }

  get filteredEvents(): HeritageEvent[] {
    const normalizedTerm = this.searchTerm.trim().toLowerCase();

    return this.events.filter((event) => {
      const matchesCategory = this.selectedCategory === 'all' || event.category === this.selectedCategory;
      const matchesSearch = !normalizedTerm || this.eventMatchesSearch(event, normalizedTerm);

      return matchesCategory && matchesSearch;
    });
  }

  get isAdmin(): boolean {
    return this.apiService.isAdmin();
  }

  get minimumEventDateTime(): string {
    return this.toDateTimeLocalValue(new Date(Date.now() + 5 * 60 * 1000));
  }

  submitEvent(): void {
    if (this.isSubmittingEvent) {
      return;
    }

    const eventDate = new Date(this.eventForm.eventDate);
    const endDate = this.eventForm.endDate ? new Date(this.eventForm.endDate) : null;

    const eventSubmission = {
      title: this.eventForm.title.trim(),
      category: this.eventForm.category.trim(),
      region: this.eventForm.region.trim(),
      city: this.eventForm.city.trim(),
      venue: this.eventForm.venue.trim(),
      description: this.eventForm.description.trim(),
      eventDate: this.eventForm.eventDate,
      endDate: this.eventForm.endDate,
      imageUrl: this.eventForm.imageUrl.trim(),
      organizer: this.eventForm.organizer.trim(),
      priceLabel: this.eventForm.priceLabel.trim(),
      mapUrl: this.eventForm.mapUrl.trim()
    };

    if (
      !eventSubmission.title ||
      !eventSubmission.category ||
      !eventSubmission.region ||
      !eventSubmission.city ||
      !eventSubmission.venue ||
      !eventSubmission.description ||
      !eventSubmission.eventDate
    ) {
      alert('Please fill in the required event details.');
      return;
    }

    if (Number.isNaN(eventDate.getTime()) || eventDate.getTime() <= Date.now()) {
      alert('Choose a valid future event date.');
      return;
    }

    if (endDate && (Number.isNaN(endDate.getTime()) || endDate.getTime() <= eventDate.getTime())) {
      alert('The end date must be after the event start date.');
      return;
    }

    this.isSubmittingEvent = true;

    this.apiService.submitEvent(eventSubmission).pipe(
      finalize(() => {
        this.isSubmittingEvent = false;
      })
    ).subscribe({
      next: (response) => {
        alert(response.message);
        this.eventForm = this.createEmptyEventForm();

        if (response.reviewStatus === 'Approved') {
          this.loadEvents();
        }
      },
      error: (err) => {
        console.error('Failed to submit event', err);
        alert(this.apiService.formatHttpError(err, 'Failed to submit event'));
      }
    });
  }

  async saveReminder(event: HeritageEvent): Promise<void> {
    if (this.savingReminderIds[event.id]) {
      return;
    }

    const offsetMinutes = Number(this.selectedReminderOffsets[event.id] ?? 60);
    const eventDate = new Date(event.eventDate);
    const remindAt = new Date(eventDate.getTime() - offsetMinutes * 60 * 1000);

    if (Number.isNaN(eventDate.getTime()) || remindAt.getTime() <= Date.now()) {
      alert('Choose a reminder time that is still in the future.');
      return;
    }

    const notificationId = this.eventNotificationService.createNotificationId(event.id, remindAt);
    this.savingReminderIds[event.id] = true;

    this.apiService.saveEventReminder({
      eventId: event.id,
      remindAt: remindAt.toISOString(),
      reminderOffsetMinutes: offsetMinutes,
      notificationId
    }).pipe(
      finalize(() => {
        this.savingReminderIds[event.id] = false;
      })
    ).subscribe({
      next: async (response) => {
        this.upsertReminder(response.reminder);

        try {
          const result = await this.eventNotificationService.scheduleEventReminder(event, response.reminder);
          alert(result.message);
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Notification could not be scheduled';
          alert(`Reminder saved, but notification setup failed. ${message}`);
        }
      },
      error: (err) => {
        console.error('Failed to save event reminder', err);
        alert(this.apiService.formatHttpError(err, 'Failed to save reminder'));
      }
    });
  }

  cancelReminder(event: HeritageEvent): void {
    const reminder = this.reminderForEvent(event.id);

    if (!reminder || this.savingReminderIds[event.id]) {
      return;
    }

    this.savingReminderIds[event.id] = true;

    this.apiService.deleteEventReminder(reminder.id).pipe(
      finalize(() => {
        this.savingReminderIds[event.id] = false;
      })
    ).subscribe({
      next: async () => {
        this.reminders = this.reminders.filter((item) => item.id !== reminder.id);

        try {
          await this.eventNotificationService.cancelEventReminder(reminder.notificationId);
        } catch (error) {
          console.error('Failed to cancel local notification', error);
        }

        alert('Reminder removed.');
      },
      error: (err) => {
        console.error('Failed to remove event reminder', err);
        alert(this.apiService.formatHttpError(err, 'Failed to remove reminder'));
      }
    });
  }

  reminderForEvent(eventId: number): EventReminder | undefined {
    return this.reminders.find((reminder) => reminder.eventId === eventId);
  }

  isSavingReminder(eventId: number): boolean {
    return Boolean(this.savingReminderIds[eventId]);
  }

  isReminderOptionDisabled(event: HeritageEvent, offsetMinutes: number): boolean {
    const eventDate = new Date(event.eventDate);
    const reminderDate = new Date(eventDate.getTime() - offsetMinutes * 60 * 1000);

    return Number.isNaN(reminderDate.getTime()) || reminderDate.getTime() <= Date.now();
  }

  formatEventDate(dateString: string): string {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return '';
    }

    return date.toLocaleString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  formatReminder(reminder: EventReminder): string {
    const option = this.reminderOptions.find((item) => item.minutes === reminder.reminderOffsetMinutes);
    return option?.label || this.formatEventDate(reminder.remindAt);
  }

  resolveMediaUrl(url: string | null | undefined): string {
    return this.apiService.resolveBackendUrl(url || '');
  }

  trackEvent(index: number, event: HeritageEvent): number {
    return event.id;
  }

  private prepareReminderOffsets(): void {
    for (const event of this.events) {
      const reminder = this.reminderForEvent(event.id);
      this.selectedReminderOffsets[event.id] = reminder?.reminderOffsetMinutes ?? this.firstAvailableOffset(event);
    }
  }

  private firstAvailableOffset(event: HeritageEvent): number {
    return this.reminderOptions.find((option) => !this.isReminderOptionDisabled(event, option.minutes))?.minutes ?? 0;
  }

  private upsertReminder(reminder: EventReminder): void {
    const index = this.reminders.findIndex((item) => item.id === reminder.id || item.eventId === reminder.eventId);

    if (index >= 0) {
      this.reminders = [
        ...this.reminders.slice(0, index),
        reminder,
        ...this.reminders.slice(index + 1)
      ];
      return;
    }

    this.reminders = [...this.reminders, reminder];
  }

  private eventMatchesSearch(event: HeritageEvent, normalizedTerm: string): boolean {
    return [
      event.title,
      event.category,
      event.region,
      event.city,
      event.venue,
      event.description,
      event.organizer,
      event.priceLabel,
      this.formatEventDate(event.eventDate)
    ].some((value) => String(value || '').toLowerCase().includes(normalizedTerm));
  }

  private createEmptyEventForm() {
    return {
      title: '',
      category: '',
      region: '',
      city: '',
      venue: '',
      description: '',
      eventDate: '',
      endDate: '',
      imageUrl: '',
      organizer: '',
      priceLabel: '',
      mapUrl: ''
    };
  }

  private toDateTimeLocalValue(date: Date): string {
    const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60 * 1000);
    return offsetDate.toISOString().slice(0, 16);
  }
}
