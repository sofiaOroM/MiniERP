import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, SesionActual } from '../models/auth.model';

const STORAGE_KEY = 'miniapp_sesion';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  /** Señal reactiva con la sesión actual (null si no hay login) */
  private sesionSignal = signal<SesionActual | null>(this.leerSesionGuardada());

  readonly sesion = this.sesionSignal.asReadonly();
  readonly estaAutenticado = computed(() => this.sesionSignal() !== null);
  readonly rolActual = computed(() => this.sesionSignal()?.rol ?? null);

  login(request: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap((resp) => {
        const sesion: SesionActual = {
          token: resp.token,
          username: resp.username,
          nombre: resp.nombre,
          rol: resp.rol
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sesion));
        this.sesionSignal.set(sesion);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.sesionSignal.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.sesionSignal()?.token ?? null;
  }

  tienePermiso(rolesPermitidos: string[]): boolean {
    const rol = this.rolActual();
    return rol !== null && rolesPermitidos.includes(rol);
  }

  private leerSesionGuardada(): SesionActual | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as SesionActual;
    } catch {
      return null;
    }
  }
}
