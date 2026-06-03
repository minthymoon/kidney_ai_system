import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDoctor } from './edit-doctor';

describe('EditDoctor', () => {
  let component: EditDoctor;
  let fixture: ComponentFixture<EditDoctor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDoctor],
    }).compileComponents();

    fixture = TestBed.createComponent(EditDoctor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
