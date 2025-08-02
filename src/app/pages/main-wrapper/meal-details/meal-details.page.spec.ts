import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MealDetailsPage } from './meal-details.page';

describe('MealDetailsPage', () => {
  let component: MealDetailsPage;
  let fixture: ComponentFixture<MealDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MealDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
