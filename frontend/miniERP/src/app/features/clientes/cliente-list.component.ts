import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ClienteService } from '../../core/services/cliente.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Cliente } from '../../core/models/cliente.model';

@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <h1>Clientes</h1>
      <a class="btn btn-primary" routerLink="/clientes/nuevo">+ Nuevo cliente</a>
    </div>

    <input type="text" placeholder="Buscar por nombre, NIT o email..."
           [ngModel]="filtro()" (ngModelChange)="filtro.set($event)"
           style="margin-bottom:16px; padding:8px; width:320px; border:1px solid #ccc; border-radius:4px;" />

    <table class="data-table">
      <thead><tr><th>Nombre</th><th>NIT</th><th>Teléfono</th><th>Email</th><th>Acciones</th></tr></thead>
      <tbody>
        @for (c of filtrados(); track c.id) {
          <tr>
            <td>{{ c.nombre }}</td>
            <td>{{ c.nit }}</td>
            <td>{{ c.telefono }}</td>
            <td>{{ c.email }}</td>
            <td class="acciones">
              <a class="btn btn-secondary" [routerLink]="['/clientes', c.id, 'editar']">Editar</a>
              <button class="btn btn-danger" type="button" (click)="eliminar(c)">Eliminar</button>
            </td>
          </tr>
        }
      </tbody>
    </table>
  `
})
export class ClienteListComponent {
  private clienteService = inject(ClienteService);
  private confirmDialog = inject(ConfirmDialogService);
  private notificacion = inject(NotificacionService);
  auth = inject(AuthService);

  clientes = signal<Cliente[]>([]);
  filtro = signal('');

  filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.clientes();
    return this.clientes().filter((c) =>
      c.nombre.toLowerCase().includes(texto) ||
      c.nit.toLowerCase().includes(texto) ||
      (c.email ?? '').toLowerCase().includes(texto)
    );
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.clienteService.listar().subscribe((data) => this.clientes.set(data));
  }

  eliminar(c: Cliente): void {
    if (!this.confirmDialog.confirmar(`¿Desactivar el cliente "${c.nombre}"?`)) return;
    this.clienteService.eliminar(c.id).subscribe(() => {
      this.notificacion.exito('Cliente desactivado.');
      this.cargar();
    });
  }
}
