import { Component, inject, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiService, HomeContent, HomeItem, HomeSection } from '../services/api.service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
 
})
export class HomePage implements OnInit {
  private readonly apiService = inject(ApiService);

  homeContent: HomeContent | null = null;
  isLoading = false;
  errorMessage = '';
  searchTerm = '';

  ngOnInit() {
    this.loadHomeContent();
  }

  loadHomeContent(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getHomeContent().pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (content) => {
        this.homeContent = content;
      },
      error: (err) => {
        console.error('Error loading home content:', err);
        this.errorMessage = err.error?.message || 'Failed to load home page content';
      }
    });
  }

  get appTitle(): string {
    return this.homeContent?.settings.appTitle || '';
  }

  get searchPlaceholder(): string {
    return this.homeContent?.settings.searchPlaceholder || '';
  }

  get profileImageUrl(): string {
    return this.resolveMediaUrl(this.homeContent?.settings.profileImageUrl || '');
  }

  get featuredItem(): HomeItem | undefined {
    return this.itemsForSection('featured')[0];
  }

  get trendingSection(): HomeSection | undefined {
    return this.sectionByKey('trending');
  }

  get recommendedSection(): HomeSection | undefined {
    return this.sectionByKey('recommended');
  }

  itemsForSection(sectionKey: string): HomeItem[] {
    const section = this.sectionByKey(sectionKey);

    if (!section) {
      return [];
    }

    const normalizedTerm = this.searchTerm.trim().toLowerCase();

    if (!normalizedTerm) {
      return section.items;
    }

    return section.items.filter((item) => this.itemMatchesSearch(item, normalizedTerm));
  }

  resolveMediaUrl(url: string | null | undefined): string {
    return this.apiService.resolveBackendUrl(url || '');
  }

  trackHomeItem(index: number, item: HomeItem): number {
    return item.id;
  }

  private sectionByKey(key: string): HomeSection | undefined {
    return this.homeContent?.sections.find((section) => section.key === key);
  }

  private itemMatchesSearch(item: HomeItem, normalizedTerm: string): boolean {
    return [
      item.eyebrow,
      item.title,
      item.subtitle,
      item.description,
      item.meta
    ].some((value) => String(value || '').toLowerCase().includes(normalizedTerm));
  }
}
