import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SummaryStepComponent } from './summary-step.component';

describe('SummaryStepComponent', () => {
  let component: SummaryStepComponent;
  let fixture: ComponentFixture<SummaryStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SummaryStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SummaryStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
