import { Component, inject } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.page.html',
  styleUrls: ['./forgot-password.page.scss'],
  standalone: false
})
export class ForgotPasswordPage {
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);

  identity = '';
  isSubmitting = false;

  onSubmit() {
    if (this.isSubmitting) return;

    const identity = this.identity.trim();
    if (!identity) {
      alert('Please enter your email or username.');
      return;
    }

    this.isSubmitting = true;

    this.apiService.forgotPassword(identity).pipe(
      finalize(() => { this.isSubmitting = false; })
    ).subscribe({
      next: (response) => {
        const pendingOtpContext = {
          userId: String(response.userId),
          email: response.email,
          expiresAt: response.expiresAt || new Date(Date.now() + 4 * 60 * 1000).toISOString()
        };

        this.apiService.setPendingOtpContext(pendingOtpContext);

        const navigationExtras: NavigationExtras = {
          queryParams: {
            userId: pendingOtpContext.userId,
            email: pendingOtpContext.email,
            mode: 'reset'
          },
          replaceUrl: true
        };

        this.router.navigate(['/otp'], navigationExtras);
      },
      error: (err) => {
        alert(this.apiService.formatHttpError(err, 'Could not send reset code'));
      }
    });
  }
}