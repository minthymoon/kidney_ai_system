import { inject, Injectable } from '@angular/core';
import { Apis } from '../../core/services/apis/apis';
import { recentActivityI } from '../home/interfaces/stats.interface';

@Injectable({
  providedIn: 'root',
})
export class ScansApisService {
  private readonly apis = inject(Apis);

  findOneScan(scanID: string) {
    return this.apis.get<recentActivityI>('admin/records/' + scanID);
  }

  findALlScans() {
    return this.apis.get<recentActivityI[]>('admin/records');
  }

  deleteScan(scanID: string) {
    return this.apis.delete('analysis/records/' + scanID);
  }
}
