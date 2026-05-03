import { inject, Injectable } from '@angular/core';
import { Apis } from '../../core/services/apis/apis';
import { StatsI } from './interfaces/stats.interface';

@Injectable({
  providedIn: 'root',
})
export class HomeApisService {
  private readonly apis = inject(Apis);

  findAllStats() {
    return this.apis.get<StatsI>('dashboard/stats');
  }
}
