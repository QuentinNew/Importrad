import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'cards', pathMatch: 'full' },
  {
    path: 'cards',
    loadComponent: () => import('./features/cards/cards').then((m) => m.Cards),
  },
  {
    path: 'practice',
    loadComponent: () => import('./features/practice/practice').then((m) => m.Practice),
  },
  {
    path: 'you',
    loadComponent: () => import('./features/you/you').then((m) => m.You),
  },
  {
    path: 'import-export',
    loadComponent: () => import('./features/cards/import-export-page').then((m) => m.ImportExportPage),
  },
];
