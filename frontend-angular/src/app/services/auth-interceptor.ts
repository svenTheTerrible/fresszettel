import { HttpInterceptorFn } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { inject, PLATFORM_ID } from '@angular/core';
import { ensureAccessToken } from './apiHelper';
import { from, switchMap } from 'rxjs';

export const ACCESS_TOKEN_KEY = 'fresszettel.accessToken';
export const REFRESH_TOKEN_KEY = 'fresszettel.refreshToken';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // localStorage doesn't exist during SSR/prerender
  if (!isPlatformBrowser(inject(PLATFORM_ID))) {
    return next(req);
  }

  return from(ensureAccessToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      const authReq = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(authReq);
    }),
  );
};
