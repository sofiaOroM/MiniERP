import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { NotificacionService } from '../services/notificacion.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const notificacion = inject(NotificacionService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        notificacion.error('Tu sesión expiró, por favor inicia sesión de nuevo.');
        authService.logout();
      } else if (error.status === 403) {
        notificacion.error('No tienes permisos para realizar esta acción.');
      } else {
        const mensaje = error.error?.message ?? 'Ocurrió un error inesperado.';
        notificacion.error(mensaje);
      }
      return throwError(() => error);
    })
  );
};
