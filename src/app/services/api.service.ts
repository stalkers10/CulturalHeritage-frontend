import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface PendingOtpContext {
  userId: string;
  email: string;
  expiresAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
}

export interface HomeSettings {
  appTitle?: string;
  searchPlaceholder?: string;
  profileImageUrl?: string;
}

export interface HomeItem {
  id: number;
  sectionKey: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  description: string | null;
  meta: string | null;
  imageUrl: string | null;
  icon: string | null;
  actionLabel: string | null;
  actionRoute: string | null;
  sortOrder: number;
}

export interface HomeSection {
  key: string;
  title: string;
  subtitle: string | null;
  actionLabel: string | null;
  actionRoute: string | null;
  layout: string;
  sortOrder: number;
  items: HomeItem[];
}

export interface HomeContent {
  status: string;
  settings: HomeSettings;
  sections: HomeSection[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = this.resolveApiBaseUrl();
  private readonly pendingOtpStorageKey = 'pendingOtpContext';
  private readonly authStorageKey = 'authSession';

  get apiBaseUrl(): string {
    return this.baseUrl;
  }

  getHello(): Observable<any> {
    return this.http.get(`${this.baseUrl}/`);
  }

  getUsers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/users`);
  }

  getTestData(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/test`);
  }

  getHomeContent(): Observable<HomeContent> {
    return this.http.get<HomeContent>(`${this.baseUrl}/api/home`);
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
    return this.http.post(`${this.baseUrl}/api/contributions`, contribution, {
      headers: this.getAuthHeaders()
    });
  }

  resolveBackendUrl(url: string): string {
    if (!url || /^https?:\/\//i.test(url)) {
      return url;
    }

    return `${this.baseUrl}${url}`;
  }

  formatHttpError(error: unknown, fallbackMessage: string): string {
    const err = error as {
      error?: { message?: string } | string;
      status?: number;
      statusText?: string;
    };
    const backendMessage = typeof err.error === 'string' ? err.error : err.error?.message;

    if (backendMessage) {
      return backendMessage;
    }

    if (err.status === 0) {
      return `${fallbackMessage}. Cannot reach the backend at ${this.baseUrl}. Make sure the backend server is running on port 3000.`;
    }

    if (err.status) {
      return `${fallbackMessage}. Server returned ${err.status}${err.statusText ? ` ${err.statusText}` : ''}.`;
    }

    return fallbackMessage;
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

  setAuthSession(session: AuthSession): void {
    if (typeof window === 'undefined') {
      return;
    }

    sessionStorage.setItem(this.authStorageKey, JSON.stringify(session));
  }

  getAuthSession(): AuthSession | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedSession = sessionStorage.getItem(this.authStorageKey);

    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(storedSession) as AuthSession;
    } catch {
      sessionStorage.removeItem(this.authStorageKey);
      return null;
    }
  }

  clearAuthSession(): void {
    if (typeof window === 'undefined') {
      return;
    }

    sessionStorage.removeItem(this.authStorageKey);
  }

  isAuthenticated(): boolean {
    const session = this.getAuthSession();

    if (!session?.token) {
      return false;
    }

    const payload = this.decodeTokenPayload(session.token);

    if (payload?.exp && payload.exp < Date.now()) {
      this.clearAuthSession();
      return false;
    }

    return true;
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.getAuthSession()?.token;

    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private resolveApiBaseUrl(): string {
    const configuredBaseUrl = this.trimTrailingSlash(environment.apiUrl || 'http://127.0.0.1:3000');

    if (typeof window === 'undefined') {
      return configuredBaseUrl;
    }

    try {
      const configuredUrl = new URL(configuredBaseUrl);
      const pageHost = window.location.hostname;
      const apiPort = configuredUrl.port || '3000';

      if (this.isLoopbackHost(pageHost)) {
        return `${configuredUrl.protocol}//127.0.0.1:${apiPort}`;
      }

      if (this.isPrivateNetworkHost(pageHost)) {
        return `${configuredUrl.protocol}//${pageHost}:${apiPort}`;
      }
    } catch {
      return configuredBaseUrl;
    }

    return configuredBaseUrl;
  }

  private trimTrailingSlash(url: string): string {
    return url.replace(/\/+$/, '');
  }

  private isLoopbackHost(host: string): boolean {
    return host === 'localhost' || host === '127.0.0.1' || host === '::1';
  }

  private isPrivateNetworkHost(host: string): boolean {
    return /^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host) ||
      /^192\.168\.\d{1,3}\.\d{1,3}$/.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\.\d{1,3}\.\d{1,3}$/.test(host);
  }

  private decodeTokenPayload(token: string): { exp?: number } | null {
    const payload = token.split('.')[0];

    if (!payload || typeof atob === 'undefined') {
      return null;
    }

    try {
      const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = normalizedPayload.padEnd(
        normalizedPayload.length + ((4 - normalizedPayload.length % 4) % 4),
        '='
      );

      return JSON.parse(atob(paddedPayload));
    } catch {
      return null;
    }
  }
}
