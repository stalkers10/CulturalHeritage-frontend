import { Component, inject } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone:false
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);

  loginData = {
    email: '',
    password: ''
  };
  showPassword = false;
  isSubmitting = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onLogin() {
    if (this.isSubmitting) {
      return;
    }

    const credentials = {
      email: this.loginData.email.trim(),
      password: this.loginData.password
    };

    if (!credentials.email || !credentials.password) {
      alert('Please enter both your identity and password.');
      return;
    }

    this.loginData.email = credentials.email;
    this.isSubmitting = true;

    this.apiService.login(credentials).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: (response) => {
        if (response.status === 'otp_sent') {
          const pendingOtpContext = {
            userId: String(response.userId),
            email: response.email || credentials.email,
            expiresAt: response.expiresAt || new Date(Date.now() + 4 * 60 * 1000).toISOString()
          };

          this.apiService.setPendingOtpContext(pendingOtpContext);

          const navigationExtras: NavigationExtras = {
            queryParams: {
              userId: pendingOtpContext.userId,
              email: pendingOtpContext.email
            },
            replaceUrl: true
          };

          this.router.navigate(['/otp'], navigationExtras);
        } else {
          this.apiService.clearPendingOtpContext();
          if (response.token && response.user) {
            this.apiService.setAuthSession({ token: response.token, user: response.user });
          }
          this.router.navigate(['/tabs/home'], { replaceUrl: true });
        }
      },
      error: (err) => {
        console.error('Login failed:', err);
        alert(this.apiService.formatHttpError(err, 'Login failed'));
      }
    });
  }

  onForgotPassword() {
    console.log('Forgot password clicked');
  }
}
