import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Uso en las rutas: canActivate: [roleGuard(['ADMINISTRACION', 'COMPRAS'])]
 * Refleja exactamente la misma matriz de permisos que @PreAuthorize en el backend.
 * Esto NO reemplaza la seguridad del backend (que sigue siendo la autoridad real);
 * solo evita que el usuario navegue a una pantalla que igual le rechazaría el API.
 */
export function roleGuard(rolesPermitidos: string[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.tienePermiso(rolesPermitidos)) {
      return true;
    }

    router.navigate(['/dashboard']);
    return false;
  };
}
