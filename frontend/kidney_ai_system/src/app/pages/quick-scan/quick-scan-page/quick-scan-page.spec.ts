import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickScanPage } from './quick-scan-page';

describe('QuickScanPage', () => {
  let component: QuickScanPage;
  let fixture: ComponentFixture<QuickScanPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuickScanPage],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickScanPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
