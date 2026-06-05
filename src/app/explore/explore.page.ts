import { Component, ElementRef, inject, OnDestroy, OnInit } from '@angular/core';
import { finalize } from 'rxjs';
import { ApiService, ExploreContent, ExploreItem, ExploreSection } from '../services/api.service';

@Component({
  selector: 'app-explore',
  templateUrl: 'explore.page.html',
  styleUrls: ['explore.page.scss'],
  standalone: false,
})
export class ExplorePage implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly el = inject(ElementRef);
  private observer: IntersectionObserver | null = null;

  exploreContent: ExploreContent | null = null;
  isLoading = false;
  errorMessage = '';
  searchTerm = '';

  ngOnInit(): void {
    this.loadExploreContent();
  }

  ionViewDidEnter(): void {
    if (!this.exploreContent && !this.isLoading) {
      this.loadExploreContent();
    } else {
      setTimeout(() => this.setupIntersectionObserver(), 0);
    }
  }

  ionViewWillLeave(): void {
    this.observer?.disconnect();
    this.observer = null;
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  loadExploreContent(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getExploreContent().pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (content) => {
        this.exploreContent = content;
        setTimeout(() => this.setupIntersectionObserver(), 0);
      },
      error: (err) => {
        console.error('Error loading explore content:', err);
        this.errorMessage = this.apiService.formatHttpError(err, 'Failed to load explore page content');
      }
    });
  }

  get appTitle(): string {
    return this.exploreContent?.settings.appTitle || '';
  }

  get searchPlaceholder(): string {
    return this.exploreContent?.settings.searchPlaceholder || '';
  }

  get profileImageUrl(): string {
    return this.resolveMediaUrl(this.exploreContent?.settings.profileImageUrl || '');
  }

  get heroSection(): ExploreSection | undefined {
    return this.sectionByLayout('hero');
  }

  get heroItem(): ExploreItem | undefined {
    return this.heroSection?.items[0];
  }

  get categorySection(): ExploreSection | undefined {
    return this.sectionByLayout('categories');
  }

  get spotlightSection(): ExploreSection | undefined {
    return this.sectionByLayout('spotlight');
  }

  itemsForSection(section: ExploreSection | undefined): ExploreItem[] {
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

  trackExploreItem(index: number, item: ExploreItem): number {
    return item.id;
  }

  private sectionByLayout(layout: string): ExploreSection | undefined {
    return this.exploreContent?.sections.find((section) => section.layout === layout);
  }

  private itemMatchesSearch(item: ExploreItem, normalizedTerm: string): boolean {
    return [
      item.eyebrow,
      item.title,
      item.subtitle,
      item.description,
      item.meta
    ].some((value) => String(value || '').toLowerCase().includes(normalizedTerm));
  }

  private setupIntersectionObserver(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    this.observer?.disconnect();

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          entry.target.classList.toggle('in-view', entry.isIntersecting);
        });
      },
      { threshold: 0.5 }
    );

    (this.el.nativeElement as HTMLElement)
      .querySelectorAll('.spotlight-card')
      .forEach((card) => this.observer!.observe(card));
  }
}
