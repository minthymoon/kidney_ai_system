import { inject, Injectable } from '@angular/core';
import { CreateScanDto } from '../patients/dtos/create-scan.dto';
import { Apis } from '../../core/services/apis/apis';
import { QuickScanResult } from './interfaces/quick-scan-result.interface';

@Injectable({
  providedIn: 'root',
})
export class QuickScanApisService {
  private readonly apis = inject(Apis);

  createQuickScan(createScanDto: CreateScanDto) {
    return this.apis.post<QuickScanResult>('analysis/quick-scan', createScanDto);
  }
}
