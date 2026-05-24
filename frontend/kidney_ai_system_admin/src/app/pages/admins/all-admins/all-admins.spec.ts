import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllAdmins } from './all-admins';

describe('AllAdmins', () => {
  let component: AllAdmins;
  let fixture: ComponentFixture<AllAdmins>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllAdmins],
    }).compileComponents();

    fixture = TestBed.createComponent(AllAdmins);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
