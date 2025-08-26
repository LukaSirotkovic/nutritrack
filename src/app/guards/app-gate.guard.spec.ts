import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { appGate } from './app-gate.guard';

describe('appGate', () => {
	const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => appGate(...guardParameters));

	beforeEach(() => {
		TestBed.configureTestingModule({});
	});

	it('should be created', () => {
		expect(executeGuard).toBeTruthy();
	});
});
