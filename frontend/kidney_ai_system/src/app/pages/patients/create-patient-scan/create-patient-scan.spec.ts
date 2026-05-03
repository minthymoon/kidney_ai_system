import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePatientScan } from './create-patient-scan';

describe('CreatePatientScan', () => {
  let component: CreatePatientScan;
  let fixture: ComponentFixture<CreatePatientScan>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePatientScan],
    }).compileComponents();

    fixture = TestBed.createComponent(CreatePatientScan);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
