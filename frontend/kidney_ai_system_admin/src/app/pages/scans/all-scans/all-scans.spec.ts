import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllScans } from './all-scans';

describe('AllScans', () => {
  let component: AllScans;
  let fixture: ComponentFixture<AllScans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllScans],
    }).compileComponents();

    fixture = TestBed.createComponent(AllScans);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
