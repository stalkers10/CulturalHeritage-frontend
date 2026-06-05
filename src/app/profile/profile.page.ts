import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService, AuthUser, UserProfile } from '../services/api.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone:false
})
export class ProfilePage implements OnInit {
  private readonly apiService = inject(ApiService);
  private readonly router = inject(Router);

  profile: UserProfile | null = null;
  profileForm = {
    name: '',
    email: '',
    phone: '',
    location: '',
    bio: ''
  };
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  selectedAvatarData = '';
  selectedAvatarName = '';
  selectedAvatarMimeType = '';
  selectedAvatarPreview = '';
  isLoading = false;
  isSavingProfile = false;
  isSavingAvatar = false;
  isChangingPassword = false;
  errorMessage = '';

  ngOnInit(): void {
    this.loadProfile();
  }

  ionViewWillEnter(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getProfile().pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response) => {
        this.applyProfile(response.profile);
        this.syncSessionFromProfile(response.profile);
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.errorMessage = this.apiService.formatHttpError(err, 'Failed to load profile');
      }
    });
  }

  saveProfile(): void {
    if (this.isSavingProfile) {
      return;
    }

    const profile = {
      name: this.profileForm.name.trim(),
      email: this.profileForm.email.trim().toLowerCase(),
      phone: this.profileForm.phone.trim(),
      location: this.profileForm.location.trim(),
      bio: this.profileForm.bio.trim()
    };

    if (!profile.name || !profile.email) {
      alert('Name and email are required.');
      return;
    }

    this.isSavingProfile = true;

    this.apiService.updateProfile(profile).pipe(
      finalize(() => {
        this.isSavingProfile = false;
      })
    ).subscribe({
      next: (response) => {
        this.applyProfile(response.profile);
        this.setMergedAuthSession(response.token, response.user);
        alert('Profile updated.');
      },
      error: (err) => {
        console.error('Failed to update profile', err);
        alert(this.apiService.formatHttpError(err, 'Failed to update profile'));
      }
    });
  }

  onAvatarSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      input.value = '';
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      alert('Avatar image must be 8 MB or smaller.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result || '');
      this.selectedAvatarData = result;
      this.selectedAvatarPreview = result;
      this.selectedAvatarName = file.name;
      this.selectedAvatarMimeType = file.type;
    };
    reader.onerror = () => {
      this.clearSelectedAvatar();
      alert('Could not read the selected image. Please choose another file.');
    };
    reader.readAsDataURL(file);
  }

  saveAvatar(): void {
    if (this.isSavingAvatar) {
      return;
    }

    if (!this.selectedAvatarData) {
      alert('Choose an avatar image first.');
      return;
    }

    this.isSavingAvatar = true;

    this.apiService.updateProfileAvatar({
      mediaData: this.selectedAvatarData,
      mediaName: this.selectedAvatarName,
      mediaMimeType: this.selectedAvatarMimeType
    }).pipe(
      finalize(() => {
        this.isSavingAvatar = false;
      })
    ).subscribe({
      next: (response) => {
        this.applyProfile(response.profile);
        this.setMergedAuthSession(response.token, response.user);
        this.clearSelectedAvatar();
        alert('Avatar updated.');
      },
      error: (err) => {
        console.error('Failed to update avatar', err);
        alert(this.apiService.formatHttpError(err, 'Failed to update avatar'));
      }
    });
  }

  changePassword(): void {
    if (this.isChangingPassword) {
      return;
    }

    if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword) {
      alert('Current and new password are required.');
      return;
    }

    if (this.passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }

    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('New password and confirmation do not match.');
      return;
    }

    this.isChangingPassword = true;

    this.apiService.changeProfilePassword({
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).pipe(
      finalize(() => {
        this.isChangingPassword = false;
      })
    ).subscribe({
      next: () => {
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        alert('Password changed.');
      },
      error: (err) => {
        console.error('Failed to change password', err);
        alert(this.apiService.formatHttpError(err, 'Failed to change password'));
      }
    });
  }

  logout(): void {
    this.apiService.clearAuthSession();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  get avatarDisplayUrl(): string {
    return this.selectedAvatarPreview || this.apiService.resolveBackendUrl(this.profile?.avatarUrl || '');
  }

  get initials(): string {
    const source = this.profile?.name || this.profileForm.name || 'User';
    return source
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'U';
  }

  clearSelectedAvatar(): void {
    this.selectedAvatarData = '';
    this.selectedAvatarName = '';
    this.selectedAvatarMimeType = '';
    this.selectedAvatarPreview = '';
  }

  private applyProfile(profile: UserProfile): void {
    this.profile = profile;
    this.profileForm = {
      name: profile.name || '',
      email: profile.email || '',
      phone: profile.phone || '',
      location: profile.location || '',
      bio: profile.bio || ''
    };
  }

  private syncSessionFromProfile(profile: UserProfile): void {
    const session = this.apiService.getAuthSession();

    if (!session?.token) {
      return;
    }

    this.apiService.setAuthSession({
      token: session.token,
      user: {
        ...session.user,
        id: profile.id,
        email: profile.email,
        name: profile.name,
        avatarUrl: profile.avatarUrl
      }
    });
  }

  private setMergedAuthSession(token: string, user: AuthUser): void {
    const currentUser = this.apiService.getAuthSession()?.user;

    this.apiService.setAuthSession({
      token,
      user: {
        ...currentUser,
        ...user,
        role: user.role || currentUser?.role
      }
    });
  }
}
