import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import { EventReminder, HeritageEvent } from './api.service';

export interface ReminderNotificationResult {
  scheduled: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class EventNotificationService {
  private readonly browserTimers = new Map<number, ReturnType<typeof setTimeout>>();
  private readonly maxBrowserDelayMs = 2147483647;

  createNotificationId(eventId: number, remindAt: Date): number {
    const timestampPart = Math.floor(remindAt.getTime() / 1000) % 100000;
    return Number(`${eventId}${timestampPart}`.slice(0, 9));
  }

  async scheduleEventReminder(event: HeritageEvent, reminder: EventReminder): Promise<ReminderNotificationResult> {
    const remindAt = new Date(reminder.remindAt);

    if (Number.isNaN(remindAt.getTime())) {
      throw new Error('Invalid reminder time');
    }

    if (remindAt.getTime() <= Date.now()) {
      throw new Error('Reminder time must be in the future');
    }

    if (this.canUseNativeNotifications()) {
      await this.ensureNativePermission();
      await LocalNotifications.schedule({
        notifications: [
          {
            id: reminder.notificationId,
            title: `Reminder: ${event.title}`,
            body: `${this.formatEventDate(event.eventDate)} at ${event.venue}, ${event.city}.`,
            schedule: { at: remindAt },
            extra: {
              eventId: event.id,
              reminderId: reminder.id
            }
          }
        ]
      });

      return { scheduled: true, message: 'Reminder saved and phone notification scheduled.' };
    }

    return this.scheduleBrowserReminder(event, reminder, remindAt);
  }

  async cancelEventReminder(notificationId: number): Promise<void> {
    const timer = this.browserTimers.get(notificationId);

    if (timer) {
      clearTimeout(timer);
      this.browserTimers.delete(notificationId);
    }

    if (this.canUseNativeNotifications()) {
      await LocalNotifications.cancel({
        notifications: [{ id: notificationId }]
      });
    }
  }

  private canUseNativeNotifications(): boolean {
    return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('LocalNotifications');
  }

  private async ensureNativePermission(): Promise<void> {
    const currentPermission = await LocalNotifications.checkPermissions();

    if (currentPermission.display === 'granted') {
      return;
    }

    const requestedPermission = await LocalNotifications.requestPermissions();

    if (requestedPermission.display !== 'granted') {
      throw new Error('Notification permission was not granted');
    }
  }

  private async scheduleBrowserReminder(
    event: HeritageEvent,
    reminder: EventReminder,
    remindAt: Date
  ): Promise<ReminderNotificationResult> {
    if (typeof window === 'undefined' || typeof Notification === 'undefined') {
      return {
        scheduled: false,
        message: 'Reminder saved. Phone notifications will work when the app runs on a device.'
      };
    }

    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();

      if (permission !== 'granted') {
        return {
          scheduled: false,
          message: 'Reminder saved, but notification permission was not granted.'
        };
      }
    }

    const delayMs = remindAt.getTime() - Date.now();

    if (delayMs > this.maxBrowserDelayMs) {
      return {
        scheduled: false,
        message: 'Reminder saved. Browser reminders only run while this tab is open; phone notifications will schedule on the mobile app.'
      };
    }

    const previousTimer = this.browserTimers.get(reminder.notificationId);

    if (previousTimer) {
      clearTimeout(previousTimer);
    }

    const timer = setTimeout(() => {
      new Notification(`Reminder: ${event.title}`, {
        body: `${this.formatEventDate(event.eventDate)} at ${event.venue}, ${event.city}.`
      });
      this.browserTimers.delete(reminder.notificationId);
    }, delayMs);

    this.browserTimers.set(reminder.notificationId, timer);

    return {
      scheduled: true,
      message: 'Reminder saved. Browser notification scheduled while this tab stays open.'
    };
  }

  private formatEventDate(dateString: string): string {
    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return 'Upcoming event';
    }

    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}
