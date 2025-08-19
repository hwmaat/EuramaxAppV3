// src/app/guards/access.guard.ts
import { inject } from '@angular/core';
import {
  CanActivateFn, CanMatchFn, Router,
  ActivatedRouteSnapshot, RouterStateSnapshot, Route, UrlSegment, UrlTree
} from '@angular/router';
import { AuthService } from '@app/services/auth.service';

// Activate AFTER route is matched (good UX redirect)
export const accessGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required: number[] = (route.data?.['access'] as number[]) ?? [];
  if (!required.length) return true;
  return auth.hasAccess(required) ? true : router.parseUrl('/');
};

// Match BEFORE lazy module loads (prevents bundle load)
export const accessMatchGuard: CanMatchFn = (
  route: Route,
  _segments: UrlSegment[]
): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const required: number[] = (route.data?.['access'] as number[]) ?? [];
  if (!required.length) return true;
  return auth.hasAccess(required) ? true : router.parseUrl('/');
};
