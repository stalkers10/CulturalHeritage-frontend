import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PendingOtpContext {
  userId: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly baseUrl = 'http://localhost:3000';
  private readonly pendingOtpStorageKey = 'pendingOtpContext';

  constructor(private http: HttpClient) { }
  
  getHello(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`);
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  getTestData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/test`);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/login`, credentials);
  }

  signup(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/signup`, userData);
  }

  verifyOtp(otpData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/verify-otp`, otpData);
  }

  getContributions(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/contributions`);
  }

  submitContribution(contribution: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/contributions`, contribution);
  }

  setPendingOtpContext(context: PendingOtpContext): void {
    if (typeof window === 'undefined') {
      return;
    }

    sessionStorage.setItem(this.pendingOtpStorageKey, JSON.stringify(context));
  }

  getPendingOtpContext(): PendingOtpContext | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedContext = sessionStorage.getItem(this.pendingOtpStorageKey);

    if (!storedContext) {
      return null;
    }

    try {
      return JSON.parse(storedContext) as PendingOtpContext;
    } catch {
      sessionStorage.removeItem(this.pendingOtpStorageKey);
      return null;
    }
  }

  clearPendingOtpContext(): void {
    if (typeof window === 'undefined') {
      return;
    }

    sessionStorage.removeItem(this.pendingOtpStorageKey);
  }
}
