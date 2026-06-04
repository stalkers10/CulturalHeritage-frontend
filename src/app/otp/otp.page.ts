import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-otp',
  templateUrl: './otp.page.html',
  styleUrls: ['./otp.page.scss'],
  standalone: false
})
export class OtpPage implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly apiService = inject(ApiService);

  userId: string = '';
  email: string = '';
  expiresAt: string = '';
  otpCode: string = '';
  timeLeft: number = 240; // 4 minutes in seconds
  timer: any;
  displayTime: string = '04:00';
  isVerifying = false;

  ngOnInit() {
    const params = this.route.snapshot.queryParamMap;
    const storedContext = this.apiService.getPendingOtpContext();

    this.userId = params.get('userId') || storedContext?.userId || '';
    this.email = params.get('email') || storedContext?.email || '';
    this.expiresAt = storedContext?.expiresAt || new Date(Date.now() + 4 * 60 * 1000).toISOString();

    if (!this.userId) {
      alert('Your verification session was lost. Please login again.');
      this.router.navigate(['/login'], { replaceUrl: true });
      return;
    }

    this.apiService.setPendingOtpContext({
      userId: this.userId,
      email: this.email,
      expiresAt: this.expiresAt
    });

    this.formatTime();
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  startTimer() {
    if (this.timer) {
      clearInterval(this.timer);
    }

    this.updateTimeLeft();
    this.formatTime();

    this.timer = setInterval(() => {
      this.updateTimeLeft();

      if (this.timeLeft > 0) {
        this.formatTime();
      } else {
        clearInterval(this.timer);
        this.apiService.clearPendingOtpContext();
        alert('OTP has expired. Please login again.');
        this.router.navigate(['/login'], { replaceUrl: true });
      }
    }, 1000);
  }

  updateTimeLeft() {
    const expiryTime = Date.parse(this.expiresAt);

    if (Number.isNaN(expiryTime)) {
      this.timeLeft = 0;
      return;
    }

    this.timeLeft = Math.max(0, Math.ceil((expiryTime - Date.now()) / 1000));
  }

  formatTime() {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    this.displayTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  onOtpInput(event: Event) {
    const inputEvent = event as CustomEvent<{ value: string | number | null }>;
    const rawValue = inputEvent.detail?.value ?? '';
    this.otpCode = String(rawValue).replace(/\D/g, '').slice(0, 6);
  }

  goBackToLogin() {
    this.apiService.clearPendingOtpContext();
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  onVerify() {
    if (this.isVerifying) {
      return;
    }

    if (!this.userId) {
      alert('Your verification session was lost. Please login again.');
      this.goBackToLogin();
      return;
    }

    this.otpCode = String(this.otpCode ?? '').replace(/\D/g, '').slice(0, 6);

    if (this.otpCode.length !== 6) {
      alert('Please enter a valid 6-digit code.');
      return;
    }

    const data = {
      userId: this.userId,
      code: this.otpCode
    };

    this.isVerifying = true;

    this.apiService.verifyOtp(data).pipe(
      finalize(() => {
        this.isVerifying = false;
      })
    ).subscribe({
      next: (response) => {
        this.apiService.clearPendingOtpContext();
        if (response.token && response.user) {
          this.apiService.setAuthSession({ token: response.token, user: response.user });
        }
        this.router.navigate(['/tabs/home'], { replaceUrl: true });
      },
      error: (err) => {
        alert(err.error?.message || 'Invalid code. Please try again.');
      }
    });
  }
}
