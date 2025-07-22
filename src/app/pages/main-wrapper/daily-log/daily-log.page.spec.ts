import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DailyLogPage } from './daily-log.page';

describe('DailyLogPage', () => {
  let component: DailyLogPage;
  let fixture: ComponentFixture<DailyLogPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(DailyLogPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
