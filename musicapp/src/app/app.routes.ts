import { Routes } from '@angular/router';
import { Login } from './features/login/login';
import { AppLayout } from './layout/app-layout/app-layout';
import { Home } from './features/home/home';
import { SearchResults } from './features/search-results/search-results';
import { PlaylistView } from './features/playlist-view/playlist-view';
import { authGuard } from './core/guards/auth-guard';

// Define las rutas de la aplicación y asigna los componentes correspondientes a cada ruta.
// La ruta 'login' es accesible sin autenticación, mientras que las rutas dentro de AppLayout requieren autenticación.
// La ruta por defecto redirige a 'home', y cualquier ruta no definida redirige a 'login'.
// authGuard se utiliza para proteger las rutas que requieren autenticación, asegurando que solo los usuarios autenticados puedan acceder a ellas.

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
