import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanDetailsPage } from './scan-details-page';

describe('ScanDetailsPage', () => {
  let component: ScanDetailsPage;
  let fixture: ComponentFixture<ScanDetailsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanDetailsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ScanDetailsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
