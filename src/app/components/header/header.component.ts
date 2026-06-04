import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  standalone: true,
  imports: [CommonModule, RouterLink],
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  @Input() title = 'Heritage & Horizon';
  @Input() profileImageUrl = '';
  @Input() showAvatar = true;

  get displayTitle(): string {
    return this.title?.trim() || 'Heritage & Horizon';
  }

  get displayProfileImageUrl(): string {
    return this.profileImageUrl?.trim() || '';
  }
}
