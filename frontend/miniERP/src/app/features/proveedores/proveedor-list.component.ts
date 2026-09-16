import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProveedorService } from '../../core/services/proveedor.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Proveedor } from '../../core/models/proveedor.model';

@Component({
  selector: 'app-proveedor-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header">
      <h1>Proveedores</h1>
      @if (auth.tienePermiso(['ADMINISTRACION','COMPRAS'])) {
        <a class="btn btn-primary" routerLink="/proveedores/nuevo">+ Nuevo proveedor</a>
      }
    </div>

    <table class="data-table">
      <thead>
      <tr>
        <th>Nombre</th><th>NIT</th><th>Teléfono</th><th>Email</th>
        @if (auth.tienePermiso(['ADMINISTRACION','COMPRAS'])) { <th>Acciones</th> }
      </tr>
      </thead>
      <tbody>
        @for (p of proveedores(); track p.id) {
          <tr>
            <td>{{ p.nombre }}</td>
            <td>{{ p.nit }}</td>
            <td>{{ p.telefono }}</td>
            <td>{{ p.email }}</td>
            @if (auth.tienePermiso(['ADMINISTRACION','COMPRAS'])) {
              <td class="acciones">
                <a class="btn btn-secondary" [routerLink]="['/proveedores', p.id, 'editar']">Editar</a>
                <button class="btn btn-danger" type="button" (click)="eliminar(p)">Eliminar</button>
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  `
})
export class ProveedorListComponent {
  private proveedorService = inject(ProveedorService);
  private confirmDialog = inject(ConfirmDialogService);
  private notificacion = inject(NotificacionService);
  auth = inject(AuthService);

  proveedores = signal<Proveedor[]>([]);

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.proveedorService.listar().subscribe((data) => this.proveedores.set(data));
  }

  eliminar(p: Proveedor): void {
    if (!this.confirmDialog.confirmar(`¿Desactivar el proveedor "${p.nombre}"?`)) return;
    this.proveedorService.eliminar(p.id).subscribe(() => {
      this.notificacion.exito('Proveedor desactivado.');
      this.cargar();
    });
  }
}
