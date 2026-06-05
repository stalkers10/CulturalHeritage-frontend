import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  private readonly apiService = inject(ApiService);
  private readonly menuCtrl = inject(MenuController);
  private readonly sessionChangeHandler = () => this.refreshSessionAvatar();

  get isAdmin(): boolean {
    return this.apiService.isAdmin();
  }

  openAdminMenu(): void {
    this.menuCtrl.open('admin-menu');
  }

  @Input() title = 'Heritage & Horizon';
  @Input() profileImageUrl = '';
  @Input() showAvatar = true;
  currentSessionAvatarUrl = '';

  ngOnInit(): void {
    this.refreshSessionAvatar();

    if (typeof window !== 'undefined') {
      window.addEventListener('authSessionChanged', this.sessionChangeHandler);
      window.addEventListener('storage', this.sessionChangeHandler);
    }
  }

  ngOnDestroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('authSessionChanged', this.sessionChangeHandler);
      window.removeEventListener('storage', this.sessionChangeHandler);
    }
  }

  get displayTitle(): string {
    return this.title?.trim() || 'Heritage & Horizon';
  }

  get displayProfileImageUrl(): string {
    return this.currentSessionAvatarUrl || this.profileImageUrl?.trim() || '';
  }

  private refreshSessionAvatar(): void {
    const avatarUrl = this.apiService.getAuthSession()?.user.avatarUrl || '';
    this.currentSessionAvatarUrl = avatarUrl ? this.apiService.resolveBackendUrl(avatarUrl) : '';
  }
}
