import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { UsuarioResponse } from '../../core/models/usuario.model';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <h1>Usuarios</h1>
      <a class="btn btn-primary" routerLink="/usuarios/nuevo">+ Nuevo usuario</a>
    </div>

    <input type="text" placeholder="Buscar por nombre, username o rol..."
           [ngModel]="filtro()" (ngModelChange)="filtro.set($event)"
           style="margin-bottom:16px; padding:8px; width:320px; border:1px solid #ccc; border-radius:4px;" />

    <table class="data-table">
      <thead><tr><th>Nombre</th><th>Username</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>
        @for (u of filtrados(); track u.id) {
          <tr>
            <td>{{ u.nombre }}</td>
            <td>{{ u.username }}</td>
            <td>{{ u.rol }}</td>
            <td>
              <span class="badge" [class.badge-ok]="u.activo" [class.badge-danger]="!u.activo">
                {{ u.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            <td class="acciones">
              <a class="btn btn-secondary" [routerLink]="['/usuarios', u.id, 'editar']">Editar</a>
              @if (u.activo) {
                <button class="btn btn-danger" type="button" (click)="desactivar(u)">Desactivar</button>
              } @else {
                <button class="btn btn-secondary" type="button" (click)="reactivar(u)">Reactivar</button>
              }
            </td>
          </tr>
        }
      </tbody>
    </table>
  `
})
export class UsuarioListComponent {
  private usuarioService = inject(UsuarioService);
  private notificacion = inject(NotificacionService);
  private confirmDialog = inject(ConfirmDialogService);

  usuarios = signal<UsuarioResponse[]>([]);
  filtro = signal('');

  filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.usuarios();
    return this.usuarios().filter((u) =>
      u.nombre.toLowerCase().includes(texto) ||
      u.username.toLowerCase().includes(texto) ||
      u.rol.toLowerCase().includes(texto)
    );
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.usuarioService.listar().subscribe((data) => this.usuarios.set(data));
  }

  desactivar(u: UsuarioResponse): void {
    if (!this.confirmDialog.confirmar(`¿Desactivar al usuario "${u.username}"?`)) return;
    this.usuarioService.desactivar(u.id).subscribe(() => {
      this.notificacion.exito('Usuario desactivado.');
      this.cargar();
    });
  }

  reactivar(u: UsuarioResponse): void {
    this.usuarioService.reactivar(u.id).subscribe(() => {
      this.notificacion.exito('Usuario reactivado.');
      this.cargar();
    });
  }
}
