import { Injectable, effect, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, throwError, distinctUntilChanged, map, filter } from 'rxjs';
import { Globals } from '@app/services/globals.service';
import {AuthResponse,LoginRequest,RefreshRequest,UserDto,UserGroupDto,UserSummary,ChangePasswordRequest} from '../models/auth.models';

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
  
  private storage = sessionStorage;

  currentUser$ = new BehaviorSubject<UserSummary | null>(null);
  user$ = this.currentUser$.asObservable();
  currentUserGroups$ = this.user$.pipe(
    map(u => u ? [{ id: u.usergroupId, name: u.usergroupName }] : [])
  );

  // Use inject instead of constructor DI
  private http = inject(HttpClient);
  private globals = inject(Globals);
  private currentUserGroupsCache: { id: number; name: string }[] = [];

  constructor() {
    this.migrateOldKeys();
    this.clearPersistedLocalTokensIfAny(); // <- ensure no auto-login from old localStorage

    this.accessToken$.next(this.storage.getItem(this.LS_ACCESS));
    this.refreshToken$.next(this.storage.getItem(this.LS_REFRESH));
    const s = this.storage.getItem(this.LS_USER);

    if (s) { try { this.currentUser$.next(JSON.parse(s) as UserSummary); } catch { /* ignore */ } }


      
      this.currentUserGroups$.subscribe(gs => this.currentUserGroupsCache = gs);
  }

  private ensureBaseUrl(): string {
    if (!this.baseUrl) {
      throw new Error('API base URL not configured. Ensure Globals.setEnvironmentMode(...) loaded settings.');
    }
    return this.baseUrl;
  }


    // Quick sync check from components/templates
  isInRole(role: string): boolean {
    const u = this.currentUser$.value;
    return !!u && (u.usergroupName ?? '').toLowerCase() === role.toLowerCase();
  }

  // Convenience:
  isAdmin(): boolean {
    return this.isInRole('Admin');
  }

  // Observable (handy if you want async pipe in templates)
  hasRole$(role: string) {
    return this.currentUser$.pipe(
      map(u => !!u && (u.usergroupName ?? '').toLowerCase() === role.toLowerCase()),
      distinctUntilChanged()
    );
  }

  hasAccess(requiredGroups: number[]): boolean {
  if (!requiredGroups || requiredGroups.length === 0) {
    return true; // no restriction
  }
  if (requiredGroups.includes(0)) {
    return true; // 0 = everyone
  }
  const userGroupIds = this.currentUserGroupsCache.map(g => g.id);
  return requiredGroups.some(id => userGroupIds.includes(id));
}


  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.globals.apiUrl('/api/auth/authenticate'), credentials).pipe(
      tap(res => this.storeAuth(res)),
      catchError(err => this.forwardHttpError(err))
    );
  }

  refresh(): Observable<AuthResponse> {
    const token = this.refreshToken$.value;
    if (!token) return throwError(() => new Error('No refresh token available'));
    const body: RefreshRequest = { refreshToken: token };
    return this.http.post<AuthResponse>(this.globals.apiUrl('/api/auth/refresh'), body).pipe(
      tap(res => this.storeAuth(res)),
      catchError(err => this.forwardHttpError(err))
    );
  }

  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(this.globals.apiUrl('/api/auth/users'), { headers: this.getAuthHeaders() }).pipe(
      catchError(err => this.forwardHttpError(err))
    );
  }

  getUserGroups(): Observable<UserGroupDto[]> {
    return this.http.get<UserGroupDto[]>(this.globals.apiUrl('/api/auth/usergroups'), { headers: this.getAuthHeaders() }).pipe(
      catchError(err => this.forwardHttpError(err))
    );
  }

  changePassword(body: ChangePasswordRequest) {
    return this.http.post<AuthResponse>(this.globals.apiUrl('/api/auth/change-password'), body).pipe(
      tap(res => this.storeAuth(res)),
      catchError(err => this.forwardHttpError(err))
    );
  }

  logout(): void {
    this.storage.removeItem(this.LS_ACCESS);
    this.storage.removeItem(this.LS_REFRESH);
    this.storage.removeItem(this.LS_USER);
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
    this.storage.setItem(this.LS_ACCESS,  res.accessToken);
    this.storage.setItem(this.LS_REFRESH, res.refreshToken);

    const user: UserSummary = {
      userId: res.userId,
      username: res.username,
      firstname: res.firstname,
      lastname: res.lastname,
      usergroupId: res.usergroupId,
      usergroupName: res.usergroupName
    };
    this.storage.setItem(this.LS_USER, JSON.stringify(user));

    this.accessToken$.next(res.accessToken);
    this.refreshToken$.next(res.refreshToken);
    this.currentUser$.next(user);
  }

  private migrateOldKeys(): void {
    const oldKeys = ['access_token', 'refresh_token', 'user'];
    for (const k of oldKeys) {
      if (this.storage.getItem(k) !== null) { this.storage.removeItem(k); }
    }
  }
  private clearPersistedLocalTokensIfAny(): void {
  const keys = [this.LS_ACCESS, this.LS_REFRESH, this.LS_USER, 'access_token', 'refresh_token', 'user'];
  for (const k of keys) this.storage.removeItem(k);
}
}