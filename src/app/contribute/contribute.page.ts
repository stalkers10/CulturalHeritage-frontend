import { Component, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-contribute',
  templateUrl: 'contribute.page.html',
  styleUrls: ['contribute.page.scss'],
  standalone: false,
})
export class ContributePage implements OnInit {
  private readonly apiService = inject(ApiService);

  contributions: any[] = [];
  contributionForm = {
    tribe: '',
    story: '',
    mediaType: 'none'
  };
  selectedFile: File | null = null;
  selectedFileName: string = '';
  selectedMediaData: string = '';
  isSubmitting = false;

  ngOnInit() {
    this.loadContributions();
  }

  ionViewWillEnter() {
    this.loadContributions();
  }

  loadContributions() {
    this.apiService.getContributions().subscribe({
      next: (data) => {
        this.contributions = data;
      },
      error: (err) => {
        console.error('Failed to load contributions', err);
      }
    });
  }

  onFileSelected(event: Event, type: string) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    this.selectedFile = file;
    this.selectedFileName = file.name;
    this.selectedMediaData = '';
    this.contributionForm.mediaType = type;

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedMediaData = String(reader.result || '');
    };
    reader.onerror = () => {
      this.selectedFile = null;
      this.selectedFileName = '';
      this.selectedMediaData = '';
      this.contributionForm.mediaType = 'none';
      alert('Could not read the selected file. Please choose another file.');
    };
    reader.readAsDataURL(file);
  }

  setMediaType(type: string) {
    this.contributionForm.mediaType = type;
  }

  submitContribution() {
    if (this.isSubmitting) {
      return;
    }

    if (!this.contributionForm.tribe || !this.contributionForm.story) {
      alert('Please fill in both the tribe name and your story.');
      return;
    }

    if (this.selectedFile && !this.selectedMediaData) {
      alert('The selected media is still loading. Please try again in a moment.');
      return;
    }

    const contribution = {
      tribe: this.contributionForm.tribe.trim(),
      story: this.contributionForm.story.trim(),
      mediaType: this.selectedFile ? this.contributionForm.mediaType : 'none',
      mediaData: this.selectedMediaData,
      mediaName: this.selectedFile?.name || '',
      mediaMimeType: this.selectedFile?.type || ''
    };

    this.isSubmitting = true;

    this.apiService.submitContribution(contribution).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: (res) => {
        alert('Contribution submitted successfully!');
        this.contributionForm = { tribe: '', story: '', mediaType: 'none' };
        this.selectedFile = null;
        this.selectedFileName = '';
        this.selectedMediaData = '';
        this.loadContributions();
      },
      error: (err) => {
        console.error('Submission failed', err);
        alert(this.apiService.formatHttpError(err, 'Failed to submit contribution'));
      }
    });
  }

  getTimeAgo(dateString: string) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 0) return 'Just now';
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  }

  getMediaUrl(url: string) {
    return this.apiService.resolveBackendUrl(url);
  }
}
