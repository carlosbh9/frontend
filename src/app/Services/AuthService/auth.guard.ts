import { CanActivateFn,Router } from '@angular/router';
import { AuthService } from './auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.getToken();
    if (!token) {
      router.navigate(['/login']);
      return false;
    }
    const userRole = authService.getRole(); // Método para obtener el rol del usuario

    //const requiredRole = route.data?.['role'];
    if (userRole === 'admin') {
      return true;
    }

    const requiredRole :string[]= route.data?.['role'] || [];
    if (requiredRole) {
     
      //if (userRole !== requiredRole) {
        if (userRole && !requiredRole.includes(userRole)) {
        router.navigate(['/dashboard']); // Redirige si no tiene el rol adecuado
        return false;
      }
    }

  return true;
};
