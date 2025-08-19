import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth.service';
import { alert } from 'devextreme/ui/dialog';
import { catchError, throwError } from 'rxjs';

// Avoid stacking multiple dialogs if many requests fail at once
let errorDialogOpen = false;

export const globalErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const auth   = inject(AuthService);

  // Skip auth endpoints to avoid loops on 401 handling
  const isAuthUrl =
    req.url.includes('/api/auth/authenticate') ||
    req.url.includes('/api/auth/refresh') ||
    req.url.includes('/api/auth/change-password');

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // Build a friendly message
      let message = 'Request failed.';
      let postAction: (() => void) | null = null;

      if (err.status === 0) {
        message = 'Server not available.';
      } else if (err.status === 401 && !isAuthUrl) {
        message = 'Session expired. Please sign in again.';
        // After the user clicks OK, clear session and go home (or to a login route)
        postAction = () => {
          auth.logout();
          router.navigateByUrl('/');
        };
      } else if (err.status === 403) {
        message = 'You do not have permission to perform this action.';
        postAction = () => router.navigateByUrl('/');
      } else if (err.status === 404) {
        message = 'Resource not found.';
      } else if (err.status >= 500) {
        message = 'Server error. Please try again later.';
      } else if (err.status === 400 || err.status === 422) {
        // Prefer backend-provided message when present
        message =
          (err.error?.message as string) ??
          (typeof err.error === 'string' ? err.error : 'Validation failed.');
        // For 400/422 we *still* show the dialog; your form can handle field-level errors too.
      }

      // Show a modal dialog that requires user action
      if (!errorDialogOpen) {
        errorDialogOpen = true;
        alert(message, 'Error').finally(() => {
          errorDialogOpen = false;
          if (postAction) postAction();
        });
      }

      // Re-throw so callers can still handle specifics if needed
      return throwError(() => err);
    })
  );
};
