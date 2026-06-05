import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { finalize } from 'rxjs';
import { ApiService } from '../services/api.service';

interface SectionOption {
  key: string;
  title: string;
}

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  standalone: false,
})
export class TabsPage {
  private readonly apiService = inject(ApiService);
  private readonly menuCtrl = inject(MenuController);
  private readonly router = inject(Router);

  /* Explore inline form */
  exploreOpen = false;
  sections: SectionOption[] = [];
  sectionsLoading = false;
  exploreForm = { sectionKey: '', title: '', eyebrow: '', imageUrl: '', actionRoute: '' };
  isSaving = false;
  saveMessage = '';
  saveSuccess = false;

  get isAdmin(): boolean {
    return this.apiService.isAdmin();
  }

  get adminName(): string {
    return this.apiService.getAuthSession()?.user?.name || 'Admin';
  }

  onMenuOpen(): void {
    if (this.sections.length === 0 && !this.sectionsLoading) {
      this.loadSections();
    }
  }

  toggleExplore(): void {
    this.exploreOpen = !this.exploreOpen;
    this.saveMessage = '';
  }

  private loadSections(): void {
    this.sectionsLoading = true;
    this.apiService.getAdminExploreSections().pipe(
      finalize(() => { this.sectionsLoading = false; })
    ).subscribe({
      next: (data: SectionOption[]) => {
        this.sections = data;
        if (data.length > 0) this.exploreForm.sectionKey = data[0].key;
      },
      error: () => {}
    });
  }

  submitExplore(): void {
    if (!this.exploreForm.sectionKey || !this.exploreForm.title.trim() || this.isSaving) return;

    this.isSaving = true;
    this.saveMessage = '';

    const payload = {
      sectionKey: this.exploreForm.sectionKey,
      title: this.exploreForm.title.trim(),
      eyebrow: this.exploreForm.eyebrow.trim() || null,
      imageUrl: this.exploreForm.imageUrl.trim() || null,
      actionRoute: this.exploreForm.actionRoute.trim() || null
    };

    this.apiService.addExploreItem(payload).pipe(
      finalize(() => { this.isSaving = false; })
    ).subscribe({
      next: () => {
        this.saveSuccess = true;
        this.saveMessage = 'Added to Explore & Trending!';
        this.exploreForm = {
          sectionKey: this.sections[0]?.key || '',
          title: '', eyebrow: '', imageUrl: '', actionRoute: ''
        };
      },
      error: (err: any) => {
        this.saveSuccess = false;
        this.saveMessage = this.apiService.formatHttpError(err, 'Failed to add item');
      }
    });
  }

  async navigateTo(path: string): Promise<void> {
    await this.menuCtrl.close('admin-menu');
    await this.router.navigateByUrl(path);
  }

  isAdminRouteActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(`${path}/`);
  }

  async closeMenu(): Promise<void> {
    await this.menuCtrl.close('admin-menu');
  }
}
