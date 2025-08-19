// src/app/admin/admin.routes.ts
import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'users' },

  // /admin/users → lazy standalone component
  {
    path: 'users',
    loadComponent: () =>
      import('./user-page2-page/user-page2-page.component')
        .then(m => m.UserPage2PageComponent),
  },
  {
    path: 'usergroups',
    loadComponent: () =>
      import('./usergroups-page/usergroups-page.component')
        .then(m => m.UserGroupsPageComponent),
  },
];
