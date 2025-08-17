import {
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

export const authTokenInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);

  // Don't attach token to auth endpoints
  const isAuthCall =
    req.url.includes('/api/auth/authenticate') ||
    req.url.includes('/api/auth/refresh');

  const token = auth.getAccessToken();
  if (!isAuthCall && token) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }

  return next(req);
};
