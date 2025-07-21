import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeightWeightStepComponent } from './height-weight-step.component';

describe('HeightWeightStepComponent', () => {
  let component: HeightWeightStepComponent;
  let fixture: ComponentFixture<HeightWeightStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HeightWeightStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeightWeightStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
