import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuarioService } from '../../core/services/usuario.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { UsuarioRequest } from '../../core/models/usuario.model';

const ROLES = [
  { id: 1, nombre: 'ADMINISTRACION' },
  { id: 2, nombre: 'COMPRAS' },
  { id: 3, nombre: 'INVENTARIO' },
  { id: 4, nombre: 'VENTAS' }
];

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>{{ usuarioId() ? 'Editar usuario' : 'Nuevo usuario' }}</h1>
    </div>

    <form class="form-card" [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>Nombre completo <input type="text" formControlName="nombre" /></label>
      <label>Username <input type="text" formControlName="username" /></label>

      <label>
        Contraseña
        <input type="password" formControlName="password"
               [placeholder]="usuarioId() ? 'Dejar en blanco para no cambiarla' : ''" />
      </label>

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
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid || guardando()">
          {{ guardando() ? 'Guardando...' : 'Guardar' }}
        </button>
        <button class="btn btn-secondary" type="button" (click)="cancelar()">Cancelar</button>
      </div>
    </form>
  `
})
export class UsuarioFormComponent {
  private fb = inject(FormBuilder);
  private usuarioService = inject(UsuarioService);
  private notificacion = inject(NotificacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  roles = ROLES;
  guardando = signal(false);
  usuarioId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    username: ['', Validators.required],
    password: [''], // obligatorio solo al crear; se valida a mano en onSubmit
    rolId: [null as number | null, Validators.required]
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.usuarioId.set(id);
      this.usuarioService.obtener(id).subscribe((u) => {
        const rol = this.roles.find((r) => r.nombre === u.rol);
        this.form.patchValue({ nombre: u.nombre, username: u.username, rolId: rol?.id ?? null });
      });
    } else {
      this.form.get('password')?.addValidators([Validators.required, Validators.minLength(6)]);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.guardando.set(true);

    const valor = this.form.getRawValue();
    const payload: UsuarioRequest = {
      nombre: valor.nombre,
      username: valor.username,
      password: valor.password ? valor.password : null,
      rolId: valor.rolId as number
    };

    const request$ = this.usuarioId()
      ? this.usuarioService.actualizar(this.usuarioId()!, payload)
      : this.usuarioService.crear(payload);

    request$.subscribe({
      next: () => {
        this.notificacion.exito('Usuario guardado correctamente.');
        this.router.navigate(['/usuarios']);
      },
      error: () => this.guardando.set(false)
    });
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }
}
