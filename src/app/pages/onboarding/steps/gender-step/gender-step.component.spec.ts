import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GenderStepComponent } from './gender-step.component';

describe('GenderStepComponent', () => {
  let component: GenderStepComponent;
  let fixture: ComponentFixture<GenderStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [GenderStepComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GenderStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
