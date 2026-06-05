import { Component, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiService, Contribution } from '../services/api.service';

@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.page.html',
  styleUrls: ['./submissions.page.scss'],
  standalone: false
})
export class SubmissionsPage implements OnInit {
  private readonly apiService = inject(ApiService);

  submissions: Contribution[] = [];
  isLoading = false;
  errorMessage = '';
  searchTerm = '';

  ngOnInit(): void {
    this.loadSubmissions();
  }

  ionViewWillEnter(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getContributions().pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (data) => {
        this.submissions = data;
      },
      error: (err) => {
        console.error('Failed to load submissions', err);
        this.errorMessage = this.apiService.formatHttpError(err, 'Failed to load submissions');
      }
    });
  }

  get filteredSubmissions(): Contribution[] {
    const normalizedTerm = this.searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return this.submissions;
    }

    return this.submissions.filter((item) => this.submissionMatchesSearch(item, normalizedTerm));
  }

  getTimeAgo(dateString: string): string {
    if (!dateString) {
      return '';
    }

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
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

  trackSubmission(index: number, item: Contribution): number {
    return item.id;
  }

  private submissionMatchesSearch(item: Contribution, normalizedTerm: string): boolean {
    return [
      item.tribe,
      item.story,
      item.status,
      item.media_type,
      item.media_name,
      item.media_mime_type,
      this.getTimeAgo(item.created_at),
      item.created_at ? new Date(item.created_at).toLocaleDateString() : ''
    ].some((value) => String(value || '').toLowerCase().includes(normalizedTerm));
  }
}
