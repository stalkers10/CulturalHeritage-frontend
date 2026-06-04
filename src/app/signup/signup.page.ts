import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.page.html',
  styleUrls: ['./signup.page.scss'],
  standalone:false
})
export class SignupPage {
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);

  signupData = {
    fullName: '',
    email: '',
    password: '',
    agreeTerms: false
  };
  showPassword = false;
  isSubmitting = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  onSignup() {
    if (this.isSubmitting) {
      return;
    }

    const signupData = {
      fullName: this.signupData.fullName.trim(),
      email: this.signupData.email.trim().toLowerCase(),
      password: this.signupData.password,
      agreeTerms: this.signupData.agreeTerms
    };

    if (!signupData.fullName || !signupData.email || !signupData.password || !signupData.agreeTerms) {
      alert('Please complete the form before continuing.');
      return;
    }

    this.isSubmitting = true;

    this.apiService.signup(signupData).pipe(
      finalize(() => {
        this.isSubmitting = false;
      })
    ).subscribe({
      next: (response) => {
        if (response.token && response.user) {
          this.apiService.setAuthSession({ token: response.token, user: response.user });
        }
        alert('Welcome to the Heritage! Your account has been created.');
        this.router.navigate(['/tabs/home'], { replaceUrl: true });
      },
      error: (err) => {
        console.error('Signup failed:', err);
        alert(this.apiService.formatHttpError(err, 'Registration failed'));
      }
    });
  }

  onSocialSignup(platform: string) {
    console.log(`Social signup with ${platform}`);
  }
}
