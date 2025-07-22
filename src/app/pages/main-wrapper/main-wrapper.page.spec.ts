import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MainWrapperPage } from './main-wrapper.page';

describe('MainWrapperPage', () => {
  let component: MainWrapperPage;
  let fixture: ComponentFixture<MainWrapperPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MainWrapperPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
