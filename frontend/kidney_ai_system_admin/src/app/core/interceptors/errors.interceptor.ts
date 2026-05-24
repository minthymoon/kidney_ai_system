import { HttpInterceptorFn, HttpResponseBase, HttpStatusCode } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, retry, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { REQUEST_ID_TOKEN_HEADER } from '../../shared/constants/general.constant';
import { DelegatedUIErrorI } from '../../shared/interfaces/delegated-ui-error.interface';
import { StorageService } from '../services/storage/storage';
import { INTERCEPTOR_SKIP_CONSTANT } from './interceptor-skip.constant';

export const errorsInterceptor: HttpInterceptorFn = (req, next) => {
  const skipIntercept = req.headers.has(INTERCEPTOR_SKIP_CONSTANT.ERRORS);
  if (skipIntercept) return next(req);

  const injector = inject(Injector);

  return next(req).pipe(
    retry({ delay: 3000, count: 1 }),
    catchError((response: DelegatedUIErrorI & HttpResponseBase) => {
      const storageService = injector.get(StorageService);
      const router = injector.get(Router);
      // const dialogService = injector.get(DialogService);
      if (!environment.isProduction) {
        console.table({
          // TODO
          requestID: response.headers.getAll(REQUEST_ID_TOKEN_HEADER),
          ...response.error,
        });
      }
      if (!!response.error.frontFacingMessage) {
        // Entity not Found exception
        response.description = [response.error.frontFacingMessage].join('</br>');
      } else if (!!response.error.frontFacingMessages) {
        // Detailed Http Exception / Entity Not Found from backend
        response.description = response.error.frontFacingMessages.join('</br>');
      } else if (response.error?.errors?.length > 0) {
        // DTO Error
        response.description = response.error?.errors.join('</br>');
      } else if (environment.isProduction && !!response.error.message) {
        response.description = Array.isArray(response.error.message)
          ? response.error.message.join('</br>')
          : response.error.message;
      } else {
        // Internal Server Error or unknown error
      }

      if (response.status === HttpStatusCode.Unauthorized && response.error.frontFacingMessage) {
        // dialogService.closeDialog();
        storageService.removeItem('accessToken');
        router.navigate(['auth/login']);
      }

      return throwError(() => response);
    }),
  );
};
