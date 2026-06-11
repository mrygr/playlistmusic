import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

// authGuard es una función que implementa la interfaz CanActivateFn para proteger rutas en la aplicación.
// Verifica si el usuario tiene una sesión activa almacenada en localStorage. Si la sesión existe, permite el acceso a la ruta.
// Si no hay sesión, redirige al usuario a la página de login y bloquea el acceso a la ruta protegida.

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userSession = localStorage.getItem('user_session');

  if (userSession) {
    return true; 
  } else {
    router.navigate(['/login']);
    return false;
  }
};
