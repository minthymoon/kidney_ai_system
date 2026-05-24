import { Inject, inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DecodedTokenI } from '../../../shared/interfaces/decoded-token.interface';
import { BROWSER_STORAGE } from '../../provoders/local-storage-token.provider';
import { UserI } from '../../../shared/interfaces/user.interface';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  public storage = inject(BROWSER_STORAGE);
  constructor(@Inject(PLATFORM_ID) private readonly platformID: Object) {}

  public set accessToken(accessToken: string | null) {
    try {
      if (accessToken == null) this.storage.removeItem('accessToken');
      else this.storage.setItem('accessToken', accessToken);
    } catch {}
  }

  public get accessToken(): string | null {
    try {
      return this.storage.getItem('accessToken');
    } catch {
      return null;
    }
  }

  public get decodedToken(): DecodedTokenI {
    const token = this.accessToken;
    if (!token) return {} as DecodedTokenI;
    try {
      return JSON.parse(atob(token.split('.')[1] ?? '')) as DecodedTokenI;
    } catch {
      return {} as DecodedTokenI;
    }
  }

  public set refreshToken(refreshToken: string | null) {
    try {
      if (refreshToken == null) this.storage.removeItem('refreshToken');
      else this.storage.setItem('refreshToken', refreshToken);
    } catch {}
  }

  public get refreshToken(): string | null {
    try {
      return this.storage.getItem('refreshToken');
    } catch {
      return null;
    }
  }

  public set language(language: string | null) {
    try {
      if (language == null) this.storage.removeItem('language');
      else this.storage.setItem('language', language);
    } catch {}
  }

  public get language(): string | null {
    try {
      return this.storage.getItem('language');
    } catch {
      return null;
    }
  }

  public set loggedInUser(loggedInUser: UserI | null) {
    if (!isPlatformBrowser(this.platformID)) return;
    try {
      if (loggedInUser == null) sessionStorage.removeItem('loggedInUser');
      else sessionStorage.setItem('loggedInUser', JSON.stringify(loggedInUser));
    } catch {}
  }

  public get loggedInUser(): UserI | null {
    if (isPlatformBrowser(this.platformID)) {
      try {
        const raw = sessionStorage.getItem('loggedInUser');
        return raw ? (JSON.parse(raw) as UserI) : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  removeItem(key: string) {
    try {
      this.storage.removeItem(key);
    } catch {}
  }
}
