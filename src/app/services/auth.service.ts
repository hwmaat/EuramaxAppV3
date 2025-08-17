import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import {
  AuthResponse,
  LoginRequest,
  RefreshRequest,
  UserDto,
  UserGroupDto,
  UserSummary
} from '../models/auth.models';



@Injectable({ providedIn: 'root' })
export class AuthService {
  // TODO: set this to your API url (copy HTTPS url from launchSettings.json or Swagger page)
  private readonly baseUrl = 'https://localhost:7205'; // <— adjust if needed

  private readonly appPrefix = 'EuramaxPortal'; // e.g., 'EuramaxPortal', 'OtherApp', etc.
  private readonly LS_ACCESS  = `${this.appPrefix}:access_token`;
  private readonly LS_REFRESH = `${this.appPrefix}:refresh_token`;
  private readonly LS_USER    = `${this.appPrefix}:user`;

  private accessToken$ = new BehaviorSubject<string | null>(null);
  private refreshToken$ = new BehaviorSubject<string | null>(null);

  currentUser$ = new BehaviorSubject<UserSummary | null>(null);
  user$ = this.currentUser$.asObservable();

  constructor(private http: HttpClient) {

    this.migrateOldKeys();
    this.accessToken$.next(localStorage.getItem(this.LS_ACCESS));
    this.refreshToken$.next(localStorage.getItem(this.LS_REFRESH));
    const s = localStorage.getItem(this.LS_USER);
    if (s) { try { this.currentUser$.next(JSON.parse(s) as UserSummary); } catch {} }
  }

    private migrateOldKeys(): void {
    // If you previously used generic keys, clear them to prevent cross-app interference
    const oldKeys = ['access_token', 'refresh_token', 'user'];
    let changed = false;
    for (const k of oldKeys) {
      if (localStorage.getItem(k) !== null) { localStorage.removeItem(k); changed = true; }
    }
    if (changed) {
      // no-op; kept for visibility if you want to log
    }
  }
  
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.baseUrl}/api/auth/authenticate`, credentials)
      .pipe(
        tap(res => this.storeAuth(res))
      );
  }

private restoreUser(): UserSummary | null {
  const s = localStorage.getItem('user');
  if (!s) return null;
  try { return JSON.parse(s) as UserSummary; } catch { return null; }
}

  refresh(): Observable<AuthResponse> {
    const token = this.refreshToken$.value;
    if (!token) throw new Error('No refresh token available');
    const body: RefreshRequest = { refreshToken: token };
    return this.http.post<AuthResponse>(`${this.baseUrl}/api/auth/refresh`, body)
      .pipe(tap(res => this.storeAuth(res)));
  }

  getUsers(): Observable<UserDto[]> {
    return this.http.get<UserDto[]>(`${this.baseUrl}/api/auth/users`, {
      headers: this.getAuthHeaders()
    });
  }

  getUserGroups(): Observable<UserGroupDto[]> {
    return this.http.get<UserGroupDto[]>(`${this.baseUrl}/api/auth/usergroups`, {
      headers: this.getAuthHeaders()
    });
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

  // ——— helpers ———
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
}
