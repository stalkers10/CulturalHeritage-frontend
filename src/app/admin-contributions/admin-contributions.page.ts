import { Component, inject } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiService, Contribution } from '../services/api.service';

@Component({
  selector: 'app-admin-contributions',
  templateUrl: './admin-contributions.page.html',
  styleUrls: ['./admin-contributions.page.scss'],
  standalone: false
})
export class AdminContributionsPage {
  private readonly apiService = inject(ApiService);

  contributions: Contribution[] = [];
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

    this.apiService.getAdminContributions().pipe(
      finalize(() => { this.isLoading = false; })
    ).subscribe({
      next: (data: Contribution[]) => { this.contributions = data; },
      error: (err: any) => {
        this.errorMessage = this.apiService.formatHttpError(err, 'Failed to load contributions');
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

    this.apiService.updateContributionStatus(id, status).pipe(
      finalize(() => { this.processingId = null; })
    ).subscribe({
      next: () => {
        this.contributions = this.contributions.filter(c => c.id !== id);
        this.showFeedback(`Contribution ${status.toLowerCase()}.`, 'success');
      },
      error: (err: any) => {
        this.showFeedback(this.apiService.formatHttpError(err, 'Action failed'), 'danger');
      }
    });
  }

  getMediaUrl(url: string | null | undefined): string {
    return this.apiService.resolveBackendUrl(url || '');
  }

  getMediaIcon(mediaType: string): string {
    if (mediaType === 'photo') return 'image';
    if (mediaType === 'audio') return 'audiotrack';
    if (mediaType === 'video') return 'movie';
    return 'article';
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return date.toLocaleDateString();
  }

  trackById(_: number, item: Contribution): number {
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
