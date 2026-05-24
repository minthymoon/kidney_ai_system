import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteAdmin } from './delete-admin';

describe('DeleteAdmin', () => {
  let component: DeleteAdmin;
  let fixture: ComponentFixture<DeleteAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteAdmin],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteAdmin);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
