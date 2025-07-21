import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GoalStepComponent } from './goal-step.component';

describe('GoalStepComponent', () => {
  let component: GoalStepComponent;
  let fixture: ComponentFixture<GoalStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GoalStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GoalStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
