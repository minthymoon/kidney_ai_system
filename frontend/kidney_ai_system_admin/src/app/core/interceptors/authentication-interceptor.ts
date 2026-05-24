import {
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
//  import { isServer } from '../../../views/shared/constants/is-server.constant';
import { INTERCEPTOR_SKIP_CONSTANT } from './interceptor-skip.constant';
import { StorageService } from '../services/storage/storage';

export const authenticationInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const storageService = inject(StorageService);

  const skipIntercept = req.headers.has(
    INTERCEPTOR_SKIP_CONSTANT.AUTHENTICATION,
  );
  if (skipIntercept) return next(req);

  const accessToken = storageService.accessToken;
  if (!accessToken) return next(req);

  const modifiedReq = req.clone({
    setHeaders: {
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return next(modifiedReq);
};
