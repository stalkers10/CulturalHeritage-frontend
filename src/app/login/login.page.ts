import { Component, OnInit } from '@angular/core';
import { Router, NavigationExtras } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone:false
})
export class LoginPage implements OnInit {
  loginData = {
    email: '',
    password: ''
  };
  showPassword = false;
  isSubmitting = false;

  constructor(private router: Router, private apiService: ApiService) { }

  ngOnInit() {
  }

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
            email: response.email || credentials.email
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
          this.router.navigate(['/tabs/tab1'], { replaceUrl: true });
        }
      },
      error: (err) => {
        alert(err.error?.message || 'Login failed. Please check your connection.');
      }
    });
  }

  onForgotPassword() {
    console.log('Forgot password clicked');
  }
}
