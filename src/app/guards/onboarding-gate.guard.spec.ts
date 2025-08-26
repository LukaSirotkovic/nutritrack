import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { onboardingGate } from './onboarding-gate.guard';

describe('onboardingGate', () => {
	const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => onboardingGate(...guardParameters));

	beforeEach(() => {
		TestBed.configureTestingModule({});
	});

	it('should be created', () => {
		expect(executeGuard).toBeTruthy();
	});
});
