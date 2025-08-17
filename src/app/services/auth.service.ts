import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, distinctUntilChanged, map, filter } from 'rxjs';
import { Globals } from '@app/services/globals.service';
import {
  AuthResponse,
  LoginRequest,
  RefreshRequest,
  UserDto,
  UserGroupDto,
  UserSummary,
  ChangePasswordRequest
} from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Base URL comes from Globals settings; no hardcoded fallback
  private baseUrl: string | null = null;

  private readonly appPrefix = 'EuramaxPortal';
  private readonly LS_ACCESS  = `${this.appPrefix}:access_token`;
  private readonly LS_REFRESH = `${this.appPrefix}:refresh_token`;
  private readonly LS_USER    = `${this.appPrefix}:user`;

  private accessToken$ = new BehaviorSubject<string | null>(null);
  private refreshToken$ = new BehaviorSubject<string | null>(null);

  currentUser$ = new BehaviorSubject<UserSummary | null>(null);
  user$ = this.currentUser$.asObservable();

  // Use inject instead of constructor DI
  private http = inject(HttpClient);
  private globals = inject(Globals);

  constructor() {
    this.migrateOldKeys();
    this.accessToken$.next(localStorage.getItem(this.LS_ACCESS));
    this.refreshToken$.next(localStorage.getItem(this.LS_REFRESH));
    const s = localStorage.getItem(this.LS_USER);
    if (s) { try { this.currentUser$.next(JSON.parse(s) as UserSummary); } catch { /* ignore */ } }

    // Pick apiBaseUrl from settings (already validated/normalized by Globals)
    this.globals.settings$
      .pipe(
        map(cfg => (cfg?.apiBaseUrl ?? '').trim()),
        filter(url => !!url),
        distinctUntilChanged()
      )
      .subscribe(url => {
        this.baseUrl = url;
      });
  }

  private ensureBaseUrl(): string {
    if (!this.baseUrl) {
      throw new Error('API base URL not configured. Ensure Globals.setEnvironmentMode(...) loaded settings.');
    }
    return this.baseUrl;
  }

  private url(path: string): string {
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${this.ensureBaseUrl()}${p}`;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.url('/api/auth/authenticate'), credentials).pipe(
      tap(res => this.storeAuth(res)),
      catchError(err => this.forwardHttpError(err))
    );
  }

  refresh(): Observable<AuthResponse> {
    const token = this.refreshToken$.value;
    if (!token) return throwError(() => new Error('No refresh token available'));
    const body: RefreshRequest = { refreshToken: token };
    return this.http.post<AuthResponse>(this.url('/api/auth/refresh'), body).pipe(
      tap(res => this.storeAuth(res)),
      catchError(err => this.forwardHttpError(err))
    );
  }

  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.url('/api/auth/users'), { headers: this.getAuthHeaders() }).pipe(
      catchError(err => this.forwardHttpError(err))
    );
  }

  getUserGroups(): Observable<UserGroupDto[]> {
    return this.http.get<UserGroupDto[]>(this.url('/api/auth/usergroups'), { headers: this.getAuthHeaders() }).pipe(
      catchError(err => this.forwardHttpError(err))
    );
  }

  changePassword(body: ChangePasswordRequest) {
    return this.http.post<AuthResponse>(this.url('/api/auth/change-password'), body).pipe(
      tap(res => this.storeAuth(res)),
      catchError(err => this.forwardHttpError(err))
    );
  }

  logout(): void {
    localStorage.removeItem(this.LS_ACCESS);
    localStorage.removeItem(this.LS_REFRESH);
    localStorage.removeItem(this.LS_USER);
    this.accessToken$.next(null);
    this.refreshToken$.next(null);
    this.currentUser$.next(null);
  }

  getAccessToken(): string | null {
    return this.accessToken$.value;
  }

  // helpers
  private forwardHttpError(err: any) {
    const msg =
      err?.status === 0
        ? 'Endpoint not available'
        : err?.error?.message || err?.message || 'Request failed';
    return throwError(() => new Error(msg));
  }

  private getAuthHeaders(): HttpHeaders {
    const token = this.accessToken$.value;
    return new HttpHeaders(token ? { Authorization: `Bearer ${token}` } : {});
  }

  private storeAuth(res: AuthResponse): void {
    localStorage.setItem(this.LS_ACCESS,  res.accessToken);
    localStorage.setItem(this.LS_REFRESH, res.refreshToken);

    const user: UserSummary = {
      userId: res.userId,
      username: res.username,
      firstname: res.firstname,
      lastname: res.lastname,
      usergroupId: res.usergroupId,
      usergroupName: res.usergroupName
    };
    localStorage.setItem(this.LS_USER, JSON.stringify(user));

    this.accessToken$.next(res.accessToken);
    this.refreshToken$.next(res.refreshToken);
    this.currentUser$.next(user);
  }

  private migrateOldKeys(): void {
    const oldKeys = ['access_token', 'refresh_token', 'user'];
    for (const k of oldKeys) {
      if (localStorage.getItem(k) !== null) { localStorage.removeItem(k); }
    }
  }
}