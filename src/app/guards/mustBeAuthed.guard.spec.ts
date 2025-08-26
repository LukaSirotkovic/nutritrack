import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { mustBeAuthed } from './mustBeAuthed.guard';

describe('mustBeAuthed', () => {
	const executeGuard: CanActivateFn = (...guardParameters) => TestBed.runInInjectionContext(() => mustBeAuthed(...guardParameters));

	beforeEach(() => {
		TestBed.configureTestingModule({});
	});

	it('should be created', () => {
		expect(executeGuard).toBeTruthy();
	});
});
