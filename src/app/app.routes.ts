import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { accessGuard, accessMatchGuard } from './guards/access.guard';

export const routes: Routes = [
  
  { path: '', component: HomeComponent },
  {
    path: 'safetysheets',
    loadChildren: () => import('./pages/safetysheets/safetysheets.routes').then(m => m.routes)
  },

  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes),
    canMatch: [accessMatchGuard],   // blocks lazy load for non-admins
    canActivate: [accessGuard],     // optional extra layer
    data: { access: [1] }           // 1 = Admin
  },
  { path: '**', redirectTo: '' }


];
