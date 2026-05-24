import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteDoctorDialog } from './delete-doctor-dialog';

describe('DeleteDoctorDialog', () => {
  let component: DeleteDoctorDialog;
  let fixture: ComponentFixture<DeleteDoctorDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteDoctorDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteDoctorDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
