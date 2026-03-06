import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../AuthService/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // S3 presigned uploads and other external URLs must pass through untouched.
  const isApiRequest = req.url.includes('/api/');
  if (!isApiRequest) {
    return next(req);
  }

  // Public booking endpoints are intentionally unauthenticated.
 const isPublicValidate =
  req.method === 'GET' &&
  /\/public-booking-links\/[^/]+$/.test(req.url);
  const isPublicPresign =
    req.method === 'POST' &&
    req.url.includes('/public-booking-links/') &&
    req.url.endsWith('/presign-passport');
  const isPublicSubmit =
    req.method === 'POST' &&
    req.url.includes('/public-booking-links/') &&
    req.url.endsWith('/submit');

  if (isPublicValidate || isPublicPresign || isPublicSubmit) {
    return next(req);
  }

  if (token) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(clonedRequest);
  }

  return next(req);
};
