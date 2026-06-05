import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map, Observable } from 'rxjs';
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
  role?: string;
  avatarUrl?: string | null;
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

export interface ExploreSettings {
  appTitle?: string;
  searchPlaceholder?: string;
  profileImageUrl?: string;
}

export interface ExploreItem {
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

export interface ExploreSection {
  key: string;
  eyebrow: string | null;
  title: string;
  subtitle: string | null;
  actionLabel: string | null;
  actionRoute: string | null;
  layout: string;
  sortOrder: number;
  items: ExploreItem[];
}

export interface ExploreContent {
  status: string;
  settings: ExploreSettings;
  sections: ExploreSection[];
}

export interface Contribution {
  id: number;
  tribe: string;
  story: string;
  media_type: 'none' | 'photo' | 'audio' | 'video' | string;
  status: string;
  created_at: string;
  media_url?: string | null;
  media_name?: string | null;
  media_mime_type?: string | null;
}

export interface HeritageEvent {
  id: number;
  title: string;
  category: string;
  region: string;
  city: string;
  venue: string;
  description: string;
  eventDate: string;
  endDate: string | null;
  imageUrl: string | null;
  organizer: string | null;
  priceLabel: string | null;
  mapUrl: string | null;
  isFeatured: boolean;
  status?: string;
}

export interface EventsResponse {
  status: string;
  events: HeritageEvent[];
}

export interface EventSubmissionRequest {
  title: string;
  category: string;
  region: string;
  city: string;
  venue: string;
  description: string;
  eventDate: string;
  endDate?: string;
  imageUrl?: string;
  organizer?: string;
  priceLabel?: string;
  mapUrl?: string;
}

export interface EventSubmissionResponse {
  status: string;
  message: string;
  eventId: number;
  reviewStatus: 'Approved' | 'Pending';
  event: HeritageEvent | null;
}

export interface EventReminder {
  id: number;
  eventId: number;
  remindAt: string;
  reminderOffsetMinutes: number;
  notificationId: number;
  eventTitle: string;
  eventDate: string;
}

export interface EventRemindersResponse {
  status: string;
  reminders: EventReminder[];
}

export interface SaveEventReminderRequest {
  eventId: number;
  remindAt: string;
  reminderOffsetMinutes: number;
  notificationId: number;
}

export interface SaveEventReminderResponse {
  status: string;
  message: string;
  reminder: EventReminder;
}

export interface UserProfileStats {
  contributionCount: number;
  approvedContributionCount: number;
  reminderCount: number;
  upcomingReminderCount: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  phone: string;
  location: string;
  bio: string;
  stats: UserProfileStats;
}

export interface ProfileResponse {
  status: string;
  profile: UserProfile;
}

export interface ProfileUpdateResponse extends ProfileResponse {
  message: string;
  token: string;
  user: AuthUser;
}

export interface ProfileUpdateRequest {
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = this.resolveApiBaseUrl();
  private readonly pendingOtpStorageKey = 'pendingOtpContext';
  private readonly authStorageKey = 'authSession';
  private readonly resetTokenStorageKey = 'resetToken';

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

  getExploreContent(): Observable<ExploreContent> {
    return this.http.get<ExploreContent>(`${this.baseUrl}/api/explore`);
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

  isAdmin(): boolean {
    return this.getAuthSession()?.user?.role === 'admin';
  }

  getAdminContributions(): Observable<Contribution[]> {
    return this.http.get<{ status: string; contributions: Contribution[] }>(`${this.baseUrl}/api/admin/contributions`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response) => response.contributions || [])
    );
  }

  updateContributionStatus(id: number, status: 'Approved' | 'Rejected'): Observable<any> {
    return this.http.patch(`${this.baseUrl}/api/admin/contributions/${id}`, { status }, { headers: this.getAuthHeaders() });
  }

  getAdminEvents(): Observable<HeritageEvent[]> {
    return this.http.get<{ status: string; events: HeritageEvent[] }>(`${this.baseUrl}/api/admin/events`, {
      headers: this.getAuthHeaders()
    }).pipe(
      map((response) => response.events || [])
    );
  }

  updateEventStatus(id: number, status: 'Approved' | 'Rejected'): Observable<any> {
    return this.http.patch(`${this.baseUrl}/api/admin/events/${id}`, { status }, { headers: this.getAuthHeaders() });
  }

  getAdminExploreSections(): Observable<any> {
    return this.http.get(`${this.baseUrl}/api/admin/explore-sections`, { headers: this.getAuthHeaders() });
  }

  addExploreItem(item: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/admin/explore-items`, item, { headers: this.getAuthHeaders() });
  }

  forgotPassword(identity: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/forgot-password`, { identity });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/api/reset-password`, { token, newPassword });
  }

  setResetToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(this.resetTokenStorageKey, token);
  }

  getResetToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(this.resetTokenStorageKey);
  }

  clearResetToken(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(this.resetTokenStorageKey);
  }

  getContributions(): Observable<Contribution[]> {
    return this.http.get<Contribution[]>(`${this.baseUrl}/api/contributions`);
  }

  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(`${this.baseUrl}/api/profile`, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfile(profile: ProfileUpdateRequest): Observable<ProfileUpdateResponse> {
    return this.http.patch<ProfileUpdateResponse>(`${this.baseUrl}/api/profile`, profile, {
      headers: this.getAuthHeaders()
    });
  }

  updateProfileAvatar(avatar: {
    mediaData: string;
    mediaName: string;
    mediaMimeType: string;
  }): Observable<ProfileUpdateResponse> {
    return this.http.post<ProfileUpdateResponse>(`${this.baseUrl}/api/profile/avatar`, avatar, {
      headers: this.getAuthHeaders()
    });
  }

  changeProfilePassword(passwords: {
    currentPassword: string;
    newPassword: string;
  }): Observable<{ status: string; message: string }> {
    return this.http.patch<{ status: string; message: string }>(`${this.baseUrl}/api/profile/password`, passwords, {
      headers: this.getAuthHeaders()
    });
  }

  getEvents(): Observable<EventsResponse> {
    return this.http.get<EventsResponse>(`${this.baseUrl}/api/events`);
  }

  submitEvent(event: EventSubmissionRequest): Observable<EventSubmissionResponse> {
    return this.http.post<EventSubmissionResponse>(`${this.baseUrl}/api/events`, event, {
      headers: this.getAuthHeaders()
    });
  }

  getEventReminders(): Observable<EventRemindersResponse> {
    return this.http.get<EventRemindersResponse>(`${this.baseUrl}/api/event-reminders`, {
      headers: this.getAuthHeaders()
    });
  }

  saveEventReminder(reminder: SaveEventReminderRequest): Observable<SaveEventReminderResponse> {
    return this.http.post<SaveEventReminderResponse>(`${this.baseUrl}/api/event-reminders`, reminder, {
      headers: this.getAuthHeaders()
    });
  }

  deleteEventReminder(reminderId: number): Observable<{ status: string; message: string }> {
    return this.http.delete<{ status: string; message: string }>(`${this.baseUrl}/api/event-reminders/${reminderId}`, {
      headers: this.getAuthHeaders()
    });
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

    localStorage.setItem(this.authStorageKey, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('authSessionChanged', { detail: session }));
  }

  getAuthSession(): AuthSession | null {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedSession = localStorage.getItem(this.authStorageKey);

    if (!storedSession) {
      return null;
    }

    try {
      return JSON.parse(storedSession) as AuthSession;
    } catch {
      localStorage.removeItem(this.authStorageKey);
      return null;
    }
  }

  clearAuthSession(): void {
    if (typeof window === 'undefined') {
      return;
    }

    localStorage.removeItem(this.authStorageKey);
    window.dispatchEvent(new CustomEvent('authSessionChanged'));
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
