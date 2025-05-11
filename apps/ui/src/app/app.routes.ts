import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { 
    path: 'users', 
    loadComponent: () => import('./users/user-list.component').then(m => m.UserListComponent) 
  },
  { 
    path: 'users/new', 
    loadComponent: () => import('./users/user-detail.component').then(m => m.UserDetailComponent) 
  },
  { 
    path: 'users/:id', 
    loadComponent: () => import('./users/user-detail.component').then(m => m.UserDetailComponent) 
  },
  { 
    path: 'users/:id/edit', 
    loadComponent: () => import('./users/user-detail.component').then(m => m.UserDetailComponent) 
  },
  { path: '**', redirectTo: 'users' }
];