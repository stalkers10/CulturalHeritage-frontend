import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false
})
export class ResetPasswordPage implements OnInit {
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);

  newPassword = '';
  confirmPassword = '';
  showPassword = false;
  showConfirm = false;
  isResetting = false;
  private token = '';

  ngOnInit() {
    const token = this.apiService.getResetToken();
    if (!token) {
      alert('Your reset session was lost. Please start over.');
      this.router.navigate(['/forgot-password'], { replaceUrl: true });
      return;
    }
    this.token = token;
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  toggleConfirm() {
    this.showConfirm = !this.showConfirm;
  }

  onReset() {
    if (this.isResetting) return;

    if (!this.newPassword || !this.confirmPassword) {
      alert('Please fill in both password fields.');
      return;
    }

    if (this.newPassword.length < 6) {
      alert('Password must be at least 6 characters.');
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    this.isResetting = true;

    this.apiService.resetPassword(this.token, this.newPassword).pipe(
      finalize(() => { this.isResetting = false; })
    ).subscribe({
      next: () => {
        this.apiService.clearResetToken();
        alert('Password reset successfully. Please log in with your new password.');
        this.router.navigate(['/login'], { replaceUrl: true });
      },
      error: (err) => {
        alert(this.apiService.formatHttpError(err, 'Failed to reset password'));
      }
    });
  }
}