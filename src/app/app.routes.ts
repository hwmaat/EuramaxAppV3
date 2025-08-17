import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  {
    path: 'safetysheets',
    loadChildren: () => import('./pages/safetysheets/safetysheets.routes').then(m => m.routes)
  },
  { path: '**', redirectTo: '' }
];
