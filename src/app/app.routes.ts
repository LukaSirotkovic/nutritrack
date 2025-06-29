import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'authentication',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.page').then((m) => m.DashboardPage),
    canActivate: [authGuard],
  },
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./pages/onboarding/onboarding.page').then(
        (m) => m.OnboardingPage
      ),
  },
  {
    path: 'add-meal',
    loadComponent: () =>
      import('./pages/add-meal/add-meal.page').then((m) => m.AddMealPage),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.page').then((m) => m.SettingsPage),
  },
  {
    path: 'authentication',
    loadComponent: () =>
      import('./pages/authentication/authentication.page').then(
        (m) => m.AuthenticationPage
      ),
  },
];
