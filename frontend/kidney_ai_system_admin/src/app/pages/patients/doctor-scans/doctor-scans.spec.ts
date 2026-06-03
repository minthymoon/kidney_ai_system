import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorScans } from './doctor-scans';

describe('DoctorScans', () => {
  let component: DoctorScans;
  let fixture: ComponentFixture<DoctorScans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorScans],
    }).compileComponents();

    fixture = TestBed.createComponent(DoctorScans);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
