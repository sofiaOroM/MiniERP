import { Component, inject } from '@angular/core';
import { NotificacionService } from '../../core/services/notificacion.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div class="toast-container">
      @for (toast of notificacion.toasts(); track toast.id) {
        <div class="toast" [class.toast-error]="toast.tipo === 'error'" [class.toast-exito]="toast.tipo === 'exito'">
          <span>{{ toast.mensaje }}</span>
          <button type="button" (click)="notificacion.cerrar(toast.id)" aria-label="Cerrar">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 16px;
      right: 16px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 1000;
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 6px;
      color: white;
      min-width: 260px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    .toast-exito { background: #2e7d32; }
    .toast-error { background: #c62828; }
    .toast button {
      background: transparent;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
      margin-left: auto;
    }
  `]
})
export class ToastComponent {
  notificacion = inject(NotificacionService);
}
