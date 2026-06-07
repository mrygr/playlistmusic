import { Routes } from '@angular/router';

import { Login } from './features/login/login';
import { AppLayout } from './layout/app-layout/app-layout';
import { Home } from './features/home/home';
import { SearchResults } from './features/search-results/search-results';
import { PlaylistView } from './features/playlist-view/playlist-view';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: Login },

  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    children: [
      { path: 'home', component: Home },
      { path: 'search', component: SearchResults },
      { path: 'playlist/:id', component: PlaylistView }, 
      
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
