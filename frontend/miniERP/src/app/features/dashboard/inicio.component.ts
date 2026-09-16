import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  template: `
    <h1>Bienvenido, {{ auth.sesion()?.nombre }}</h1>
    <p>Usa el menú de la izquierda para navegar según tu rol ({{ auth.sesion()?.rol }}).</p>
  `
})
export class InicioComponent {
  auth = inject(AuthService);
}
