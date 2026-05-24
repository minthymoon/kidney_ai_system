import { PLATFORM_ID, inject, InjectionToken } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const BROWSER_STORAGE = new InjectionToken<Storage>('Browser Storage', {
  providedIn: 'root',
  factory: () => {
    const platformId = inject(PLATFORM_ID);

    const memoryStorage = (() => {
      let store: Record<string, string> = {};
      return {
        get length() {
          return Object.keys(store).length;
        },
        clear() {
          store = {};
        },
        getItem(key: string) {
          return Object.prototype.hasOwnProperty.call(store, key)
            ? store[key]
            : null;
        },
        key(index: number) {
          return Object.keys(store)[index] ?? null;
        },
        removeItem(key: string) {
          delete store[key];
        },
        setItem(key: string, value: string) {
          store[key] = String(value);
        },
      } satisfies Storage;
    })();

    if (!isPlatformBrowser(platformId)) return memoryStorage;

    try {
      const storage = localStorage;
      storage.setItem('__storage_test__', '1');
      storage.removeItem('__storage_test__');
      return storage;
    } catch {
      return memoryStorage;
    }
  },
});
