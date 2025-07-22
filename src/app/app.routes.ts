import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './guards/login.guard';
import { onboardingGuard } from './guards/onboarding.guard';
import { MainWrapperPage } from './pages/main-wrapper/main-wrapper.page';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'loading',
    pathMatch: 'full',
  },
  {
    path: 'loading',
    loadComponent: () =>
      import('./pages/loading/loading.page').then((m) => m.LoadingPage),
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./pages/register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'onboarding',
    canActivate: [onboardingGuard],
    loadComponent: () =>
      import('./pages/onboarding/onboarding.page').then(
        (m) => m.OnboardingPage
      ),
  },

  // === WRAPPER (Layout) ROUTE ===
  {
    path: '',
    component: MainWrapperPage, // samo za Angular 15+ standalone, ili loadComponent: ... za Angular 16+
    canActivate: [authGuard], // Sve child rute su zaštićene!
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/main-wrapper/dashboard/dashboard.page').then(
            (m) => m.DashboardPage
          ),
      },
      {
        path: 'add-meal',
        loadComponent: () =>
          import('./pages/main-wrapper/add-meal/add-meal.page').then(
            (m) => m.AddMealPage
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./pages/main-wrapper/settings/settings.page').then(
            (m) => m.SettingsPage
          ),
      },
      {
        path: 'daily-log',
        loadComponent: () =>
          import('./pages/main-wrapper/daily-log/daily-log.page').then(
            (m) => m.DailyLogPage
          ),
      },
      // Možeš dodati još child ruta ovdje
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
];
