import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
    title: 'Anmeldung Fresszettel',
  },
  {
    path: 'admin/speisekarte',
    loadComponent: () => import('./pages/admin/speisekarte/speisekarte').then((m) => m.Speisekarte),
    title: 'Speisekarte',
  },
];
