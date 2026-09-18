import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionService } from '../../core/services/notificacion.service';

function passwordsCoincidenValidator(control: AbstractControl): ValidationErrors | null {
  const nuevo = control.get('passwordNuevo')?.value;
  const confirmar = control.get('passwordConfirmar')?.value;
  return nuevo && confirmar && nuevo !== confirmar ? { noCoinciden: true } : null;
}

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <div class="bienvenida-card">
      <div class="avatar">{{ iniciales() }}</div>
      <div>
        <h1>{{ saludo() }}, {{ auth.sesion()?.nombre }}</h1>
        <p class="subtitulo">
          <span class="badge badge-ok">{{ auth.sesion()?.rol }}</span>
          &nbsp;usuario: <strong>{{ auth.sesion()?.username }}</strong>
        </p>
      </div>
    </div>

    <div class="accesos-rapidos">
      <h2>Accesos rápidos</h2>
      <div class="chips">
        <a class="chip" routerLink="/productos">Productos</a>
        @if (auth.tienePermiso(['ADMINISTRACION','COMPRAS','INVENTARIO'])) {
          <a class="chip" routerLink="/compras">Compras</a>
        }
        @if (auth.tienePermiso(['ADMINISTRACION','VENTAS','INVENTARIO'])) {
          <a class="chip" routerLink="/ventas">Ventas</a>
        }
        @if (auth.tienePermiso(['INVENTARIO'])) {
          <a class="chip" routerLink="/inventario/ajustes">Ajustes de inventario</a>
        }
        @if (auth.tienePermiso(['ADMINISTRACION'])) {
          <a class="chip" routerLink="/usuarios">Usuarios</a>
          <a class="chip" routerLink="/reportes/logs">Logs</a>
        }
      </div>
    </div>

    <div class="form-card" style="max-width: 420px;">
      @if (!mostrarFormulario()) {
        <button class="btn btn-secondary" type="button" style="width:fit-content;" (click)="mostrarFormulario.set(true)">
          Cambiar mi contraseña
        </button>
      } @else {
        <h2 style="margin:0; font-size:16px;">Cambiar mi contraseña</h2>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" style="display:flex; flex-direction:column; gap:14px;">
          <label>
            Contraseña actual
            <input type="password" formControlName="passwordActual" autocomplete="current-password" />
          </label>
          <label>
            Nueva contraseña
            <input type="password" formControlName="passwordNuevo" autocomplete="new-password" />
          </label>
          <label>
            Confirmar nueva contraseña
            <input type="password" formControlName="passwordConfirmar" autocomplete="new-password" />
          </label>
          @if (form.errors?.['noCoinciden'] && form.get('passwordConfirmar')?.touched) {
            <p class="field-error">Las contraseñas nuevas no coinciden.</p>
          }
          <div class="form-actions">
            <button class="btn btn-primary" type="submit" [disabled]="form.invalid || guardando()">
              {{ guardando() ? 'Guardando...' : 'Guardar' }}
            </button>
            <button class="btn btn-secondary" type="button" (click)="cancelar()">Cancelar</button>
          </div>
        </form>
      }
    </div>
  `,
  styles: [`
    .bienvenida-card {
      display: flex;
      align-items: center;
      gap: 20px;
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      margin-bottom: 24px;
    }
    .avatar {
      width: 64px; height: 64px;
      border-radius: 50%;
      background: #1565c0;
      color: white;
      display: flex; align-items: center; justify-content: center;
      font-size: 22px; font-weight: 600;
      flex-shrink: 0;
    }
    .bienvenida-card h1 { margin: 0 0 4px; font-size: 22px; }
    .subtitulo { margin: 0; font-size: 14px; color: #555; }
    .accesos-rapidos { margin-bottom: 24px; }
    .accesos-rapidos h2 { font-size: 15px; margin: 0 0 10px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .chip {
      padding: 8px 14px;
      background: white;
      border: 1px solid #ddd;
      border-radius: 20px;
      font-size: 13px;
      text-decoration: none;
      color: #1a2332;
    }
    .chip:hover { background: #f0f4f8; border-color: #1565c0; }
  `]
})
export class InicioComponent {
  auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private notificacion = inject(NotificacionService);

  mostrarFormulario = signal(false);
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    passwordActual: ['', Validators.required],
    passwordNuevo: ['', [Validators.required, Validators.minLength(6)]],
    passwordConfirmar: ['', Validators.required]
  }, { validators: passwordsCoincidenValidator });

  saludo = computed(() => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  });

  iniciales = computed(() => {
    const nombre = this.auth.sesion()?.nombre ?? '';
    return nombre
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('');
  });

  onSubmit(): void {
    if (this.form.invalid) return;
    this.guardando.set(true);
    const { passwordActual, passwordNuevo } = this.form.getRawValue();

    this.auth.cambiarPassword({ passwordActual, passwordNuevo }).subscribe({
      next: () => {
        this.notificacion.exito('Contraseña actualizada correctamente.');
        this.guardando.set(false);
        this.cancelar();
      },
      error: () => this.guardando.set(false)
    });
  }

  cancelar(): void {
    this.form.reset();
    this.mostrarFormulario.set(false);
  }
}
