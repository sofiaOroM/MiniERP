import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { UsuarioService } from '../../core/services/usuario.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { UsuarioResponse } from '../../core/models/usuario.model';

const ROLES = [
  { id: 1, nombre: 'ADMINISTRACION' },
  { id: 2, nombre: 'COMPRAS' },
  { id: 3, nombre: 'INVENTARIO' },
  { id: 4, nombre: 'VENTAS' }
];

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header"><h1>Usuarios</h1></div>

    <table class="data-table">
      <thead><tr><th>Nombre</th><th>Username</th><th>Rol</th><th>Estado</th><th>Acciones</th></tr></thead>
      <tbody>
        @for (u of usuarios(); track u.id) {
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

    <form class="form-card" style="margin-top:20px; max-width:420px;" [formGroup]="form" (ngSubmit)="crear()">
      <h2 style="margin:0; font-size:16px;">Nuevo usuario</h2>
      <label>Nombre completo <input type="text" formControlName="nombre" /></label>
      <label>Username <input type="text" formControlName="username" /></label>
      <label>Contraseña <input type="password" formControlName="password" /></label>
      <label>
        Rol
        <select formControlName="rolId">
          <option [ngValue]="null" disabled>Selecciona un rol</option>
          @for (r of roles; track r.id) {
            <option [ngValue]="r.id">{{ r.nombre }}</option>
          }
        </select>
      </label>
      <div class="form-actions">
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid">Crear usuario</button>
      </div>
    </form>
  `
})
export class UsuarioListComponent {
  private usuarioService = inject(UsuarioService);
  private notificacion = inject(NotificacionService);
  private confirmDialog = inject(ConfirmDialogService);
  private fb = inject(FormBuilder);

  usuarios = signal<UsuarioResponse[]>([]);
  roles = ROLES;

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rolId: [null as number | null, Validators.required]
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.usuarioService.listar().subscribe((data) => this.usuarios.set(data));
  }

  crear(): void {
    if (this.form.invalid) return;
    const valor = this.form.getRawValue();
    this.usuarioService.crear({ ...valor, rolId: valor.rolId as number }).subscribe(() => {
      this.notificacion.exito('Usuario creado.');
      this.form.reset();
      this.cargar();
    });
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
