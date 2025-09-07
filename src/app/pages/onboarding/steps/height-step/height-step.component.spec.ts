import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeightStepComponent } from './height-step.component';

describe('HeightStepComponent', () => {
	let component: HeightStepComponent;
	let fixture: ComponentFixture<HeightStepComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [HeightStepComponent],
		}).compileComponents();

		fixture = TestBed.createComponent(HeightStepComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
