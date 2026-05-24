import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { StorageService } from '../services/storage/storage';
import { checkNullability } from '../../shared/utils/nullability.util';
import { DecodedTokenI } from '../../shared/interfaces/decoded-token.interface';

export const authenticationGuard: CanActivateFn = (route, _state) => {
  const {} = route;
  const storageService = inject(StorageService);
  const router = inject(Router);

  const token = storageService.accessToken;

  if (!checkNullability(token)) {
    console.error('No token found');
    router.navigate(['auth/login']);
    return false;
  }

  let decodedToken: DecodedTokenI;
  try {
    const stringifiedDecodedToken = atob(token!.split('.')[1]);
    decodedToken = JSON.parse(stringifiedDecodedToken);
  } catch (error) {
    console.error('Error decoding token:', error);
    router.navigate(['auth/login']);
    return false;
  }

  const expired = Math.floor(new Date().getTime() / 1000) >= decodedToken.exp;

  if (expired) {
    console.error('Token has expired');
    router.navigate(['auth/login']);
    return false;
  }

  return true;
};
