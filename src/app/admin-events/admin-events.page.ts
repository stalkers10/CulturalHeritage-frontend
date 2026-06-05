import { Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiService, HeritageEvent } from '../services/api.service';

@Component({
  selector: 'app-admin-events',
  templateUrl: './admin-events.page.html',
  styleUrls: ['./admin-events.page.scss'],
  standalone: false
})
export class AdminEventsPage {
  private readonly apiService = inject(ApiService);

  events: HeritageEvent[] = [];
  isLoading = false;
  errorMessage = '';
  processingId: number | null = null;
  toastMessage = '';
  toastColor = 'success';
  showToast = false;

  ionViewWillEnter(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getAdminEvents().pipe(
      finalize(() => { this.isLoading = false; })
    ).subscribe({
      next: (data: HeritageEvent[]) => { this.events = data; },
      error: (err: any) => {
        this.errorMessage = this.apiService.formatHttpError(err, 'Failed to load events');
      }
    });
  }

  approve(id: number): void {
    this.setStatus(id, 'Approved');
  }

  reject(id: number): void {
    this.setStatus(id, 'Rejected');
  }

  private setStatus(id: number, status: 'Approved' | 'Rejected'): void {
    this.processingId = id;

    this.apiService.updateEventStatus(id, status).pipe(
      finalize(() => { this.processingId = null; })
    ).subscribe({
      next: () => {
        this.events = this.events.filter(e => e.id !== id);
        this.showFeedback(`Event ${status.toLowerCase()}.`, 'success');
      },
      error: (err: any) => {
        this.showFeedback(this.apiService.formatHttpError(err, 'Action failed'), 'danger');
      }
    });
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getImageUrl(url: string | null | undefined): string {
    return this.apiService.resolveBackendUrl(url || '');
  }

  trackById(_: number, item: HeritageEvent): number {
    return item.id;
  }

  private showFeedback(message: string, color: string): void {
    this.toastMessage = message;
    this.toastColor = color;
    this.showToast = true;
  }

  dismissToast(): void {
    this.showToast = false;
  }
}
