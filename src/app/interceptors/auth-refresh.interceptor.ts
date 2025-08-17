import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

let refreshInProgress = false;
const refreshTokenSubject = new ReplaySubject<string>(1);

export const authRefreshInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const auth = inject(AuthService);

  // Never try to refresh while calling auth endpoints
  const isAuthCall =
    req.url.includes('/api/auth/authenticate') ||
    req.url.includes('/api/auth/refresh');
  if (isAuthCall) return next(req);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status !== 401) return throwError(() => err);

      // If a refresh is already happening, wait for it then retry
      if (refreshInProgress) {
        return refreshTokenSubject.pipe(
          filter(token => !!token),
          take(1),
          switchMap(token =>
            next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }))
          )
        );
      }

      // Start a refresh once
      refreshInProgress = true;
      refreshTokenSubject.next(''); // reset gate

      return auth.refresh().pipe(
        switchMap(res => {
          refreshInProgress = false;
          refreshTokenSubject.next(res.accessToken);
          // Retry original request with the fresh token
          return next(
            req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } })
          );
        }),
        catchError(refreshErr => {
          refreshInProgress = false;
          auth.logout(); // drop tokens & user
          return throwError(() => refreshErr);
        })
      );
    })
  );
};
