import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../auth/auth.store';

/**
 * Angular HttpClient interceptor for handling 401 errors.
 * Note: This only applies to Angular HttpClient calls, NOT to the @hey-api SDK
 * which uses fetch() with its own interceptors in api-config.ts.
 */
export const refreshInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && !req.url.includes('/auth/')) {
        authStore.clearAuth();
        window.location.href = '/login';
      }
      return throwError(() => err);
    }),
  );
};
