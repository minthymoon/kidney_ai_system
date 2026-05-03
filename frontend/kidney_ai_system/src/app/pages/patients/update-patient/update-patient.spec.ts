import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdatePatient } from './update-patient';

describe('UpdatePatient', () => {
  let component: UpdatePatient;
  let fixture: ComponentFixture<UpdatePatient>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdatePatient],
    }).compileComponents();

    fixture = TestBed.createComponent(UpdatePatient);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
