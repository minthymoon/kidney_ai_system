import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ResponseFromBackendI } from '../../../shared/interfaces/response-from-backend.interface';

@Injectable({
  providedIn: 'root',
})
export class Apis {
  loading$: BehaviorSubject<boolean> = new BehaviorSubject(false);

  private readonly http = inject(HttpClient);

  get = <T>(url: string, params?: any): Observable<ResponseFromBackendI<T>> => {
    let httpParams = new HttpParams();

    if (params && typeof params === 'object' && !Array.isArray(params)) {
      for (const property in params) {
        if (params[property] !== null && params[property] !== undefined) {
          httpParams = httpParams.set(property, params[property]);
        }
      }
    }

    return this.http.get<ResponseFromBackendI<T>>(`${environment.beUrl}${url}`, {
      params: httpParams,
    });
  };
  post = <T>(url: string, body: any): Observable<ResponseFromBackendI<T>> => {
    return this.http.post<ResponseFromBackendI<T>>(`${environment.beUrl}${url}`, body);
  };

  patch = <T>(url: string, body?: any): Observable<ResponseFromBackendI<T>> => {
    return this.http.patch<ResponseFromBackendI<T>>(`${environment.beUrl}${url}`, body);
  };

  put = <T>(url: string, body?: any): Observable<ResponseFromBackendI<T>> => {
    return this.http.put<ResponseFromBackendI<T>>(`${environment.beUrl}${url}`, body);
  };

  delete = <T>(url: string, params?: any): Observable<ResponseFromBackendI<T>> => {
    let httpParams = new HttpParams();
    for (const property in params) {
      httpParams = httpParams.set(property, params[property]);
    }
    return this.http.delete<ResponseFromBackendI<T>>(`${environment.beUrl}${url}`, {
      params: httpParams,
    });
  };
}
