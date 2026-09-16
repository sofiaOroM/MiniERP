import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-page">
      <form class="login-card" [formGroup]="form" (ngSubmit)="onSubmit()">
        <h1>Mini ERP</h1>
        <p class="subtitulo">Ingresa con tu usuario</p>

        <label>
          Usuario
          <input type="text" formControlName="username" autocomplete="username" />
        </label>

        <label>
          Contraseña
          <input type="password" formControlName="password" autocomplete="current-password" />
        </label>

        @if (errorMensaje()) {
          <p class="error">{{ errorMensaje() }}</p>
        }

        <button type="submit" [disabled]="form.invalid || cargando()">
          {{ cargando() ? 'Ingresando...' : 'Ingresar' }}
        </button>
      </form>
    </div>
  `,
  styles: [`
    .login-page {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f4f5f7;
    }
    .login-card {
      background: white;
      padding: 32px;
      border-radius: 8px;
      box-shadow: 0 2px 12px rgba(0,0,0,0.1);
      width: 320px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    h1 { margin: 0; font-size: 22px; }
    .subtitulo { margin: 0 0 8px; color: #666; font-size: 14px; }
    label { display: flex; flex-direction: column; gap: 4px; font-size: 14px; }
    input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; font-size: 14px; }
    button {
      margin-top: 8px;
      padding: 10px;
      background: #1565c0;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      cursor: pointer;
    }
    button:disabled { background: #90a4ae; cursor: not-allowed; }
    .error { color: #c62828; font-size: 13px; margin: 0; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  cargando = signal(false);
  errorMensaje = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit(): void {
    if (this.form.invalid) return;

    this.cargando.set(true);
    this.errorMensaje.set(null);

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.cargando.set(false);
        this.router.navigate(['/']);
      },
      error: () => {
        this.cargando.set(false);
        this.errorMensaje.set('Usuario o contraseña incorrectos.');
      }
    });
  }
}
