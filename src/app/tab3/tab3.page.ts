import { Component, OnInit } from '@angular/core';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: false,
})
export class Tab3Page implements OnInit {
  contributions: any[] = [];
  contributionForm = {
    tribe: '',
    story: '',
    mediaType: 'none'
  };
  selectedFile: File | null = null;
  selectedFileName: string = '';

  constructor(private apiService: ApiService) {}

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

  onFileSelected(event: any, type: string) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.contributionForm.mediaType = type;
    }
  }

  setMediaType(type: string) {
    this.contributionForm.mediaType = type;
  }

  submitContribution() {
    if (!this.contributionForm.tribe || !this.contributionForm.story) {
      alert('Please fill in both the tribe name and your story.');
      return;
    }

    // In a real app, we would use FormData to upload the file
    // For this prototype, we'll just send the metadata
    this.apiService.submitContribution(this.contributionForm).subscribe({
      next: (res) => {
        alert('Contribution submitted successfully!');
        this.contributionForm = { tribe: '', story: '', mediaType: 'none' };
        this.selectedFile = null;
        this.selectedFileName = '';
        this.loadContributions();
      },
      error: (err) => {
        console.error('Submission failed', err);
        alert('Failed to submit contribution. Please try again.');
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
}
