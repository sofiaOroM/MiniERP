import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  /**
   * Implementación mínima con confirm() nativo. Se deja como service
   * inyectable a propósito: cambiar a un modal propio más adelante no
   * requiere tocar ningún componente que ya lo use.
   */
  confirmar(mensaje: string): boolean {
    return window.confirm(mensaje);
  }
}
