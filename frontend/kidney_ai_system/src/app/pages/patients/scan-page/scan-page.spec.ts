import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ScanPage } from './scan-page';

describe('ScanPage', () => {
  let component: ScanPage;
  let fixture: ComponentFixture<ScanPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScanPage],
    }).compileComponents();

    fixture = TestBed.createComponent(ScanPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
