import { Component, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiService } from '../services/api.service';

interface SectionOption {
  key: string;
  title: string;
}

@Component({
  selector: 'app-admin-explore',
  templateUrl: './admin-explore.page.html',
  styleUrls: ['./admin-explore.page.scss'],
  standalone: false
})
export class AdminExplorePage implements OnInit {
  private readonly apiService = inject(ApiService);

  sections: SectionOption[] = [];
  isSectionsLoading = false;
  isSaving = false;
  errorMessage = '';
  toastMessage = '';
  toastColor = 'success';
  showToast = false;

  form = {
    sectionKey: '',
    title: '',
    eyebrow: '',
    imageUrl: '',
    actionRoute: ''
  };

  ngOnInit(): void {
    this.loadSections();
  }

  ionViewWillEnter(): void {
    if (this.sections.length === 0) {
      this.loadSections();
    }
  }

  loadSections(): void {
    this.isSectionsLoading = true;

    this.apiService.getAdminExploreSections().pipe(
      finalize(() => { this.isSectionsLoading = false; })
    ).subscribe({
      next: (data: SectionOption[]) => {
        this.sections = data;
        if (data.length > 0 && !this.form.sectionKey) {
          this.form.sectionKey = data[0].key;
        }
      },
      error: (err: any) => {
        this.errorMessage = this.apiService.formatHttpError(err, 'Failed to load sections');
      }
    });
  }

  submit(): void {
    if (!this.form.sectionKey || !this.form.title.trim()) return;

    this.isSaving = true;
    this.errorMessage = '';

    const payload = {
      sectionKey: this.form.sectionKey,
      title: this.form.title.trim(),
      eyebrow: this.form.eyebrow.trim() || null,
      imageUrl: this.form.imageUrl.trim() || null,
      actionRoute: this.form.actionRoute.trim() || null
    };

    this.apiService.addExploreItem(payload).pipe(
      finalize(() => { this.isSaving = false; })
    ).subscribe({
      next: () => {
        this.resetForm();
        this.showFeedback('Item added to Explore and Trending.', 'success');
      },
      error: (err: any) => {
        this.errorMessage = this.apiService.formatHttpError(err, 'Failed to add item');
      }
    });
  }

  resetForm(): void {
    this.form = {
      sectionKey: this.sections[0]?.key || '',
      title: '',
      eyebrow: '',
      imageUrl: '',
      actionRoute: ''
    };
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
