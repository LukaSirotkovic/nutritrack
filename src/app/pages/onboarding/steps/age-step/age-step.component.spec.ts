import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AgeStepComponent } from './age-step.component';

describe('AgeStepComponent', () => {
  let component: AgeStepComponent;
  let fixture: ComponentFixture<AgeStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AgeStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgeStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
