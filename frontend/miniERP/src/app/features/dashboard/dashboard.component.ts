import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="layout">
      <aside class="sidebar">
        <h2>Mini ERP</h2>
        <nav>
          <a routerLink="/inicio" routerLinkActive="activo">Inicio</a>

          <a routerLink="/productos" routerLinkActive="activo">Productos</a>
          <a routerLink="/categorias" routerLinkActive="activo">Categorías</a>

          @if (auth.tienePermiso(['ADMINISTRACION','COMPRAS','INVENTARIO'])) {
            <a routerLink="/proveedores" routerLinkActive="activo">Proveedores</a>
          }
          @if (auth.tienePermiso(['ADMINISTRACION','COMPRAS','INVENTARIO'])) {
            <a routerLink="/compras" routerLinkActive="activo">Compras</a>
          }
          @if (auth.tienePermiso(['ADMINISTRACION','VENTAS'])) {
            <a routerLink="/clientes" routerLinkActive="activo">Clientes</a>
          }
          @if (auth.tienePermiso(['ADMINISTRACION','VENTAS','INVENTARIO'])) {
            <a routerLink="/ventas" routerLinkActive="activo">Ventas</a>
          }
          @if (auth.tienePermiso(['INVENTARIO'])) {
            <a routerLink="/inventario/ajustes" routerLinkActive="activo">Ajustes de inventario</a>
          }
          @if (auth.tienePermiso(['ADMINISTRACION'])) {
            <a routerLink="/usuarios" routerLinkActive="activo">Usuarios</a>
          }

          <p class="separador">Reportes</p>
          @if (auth.tienePermiso(['ADMINISTRACION','INVENTARIO'])) {
            <a routerLink="/reportes/productos" routerLinkActive="activo">Productos / Inventario</a>
          }
          @if (auth.tienePermiso(['ADMINISTRACION','COMPRAS'])) {
            <a routerLink="/reportes/compras" routerLinkActive="activo">Compras / Proveedores</a>
          }
          @if (auth.tienePermiso(['ADMINISTRACION','VENTAS'])) {
            <a routerLink="/reportes/ventas" routerLinkActive="activo">Ventas / Clientes</a>
          }
          @if (auth.tienePermiso(['ADMINISTRACION'])) {
            <a routerLink="/reportes/logs" routerLinkActive="activo">Logs</a>
          }
        </nav>
      </aside>

      <div class="main">
        <header class="topbar">
          <span>{{ auth.sesion()?.nombre }} · {{ auth.sesion()?.rol }}</span>
          <button type="button" (click)="auth.logout()">Cerrar sesión</button>
        </header>
        <main class="contenido">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [`
    .layout { display: flex; min-height: 100vh; }
    .sidebar {
      width: 240px;
      background: #1a2332;
      color: white;
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }
    .sidebar h2 { font-size: 18px; margin: 0 0 20px; }
    .sidebar nav { display: flex; flex-direction: column; gap: 4px; }
    .sidebar a {
      color: #cfd8dc;
      text-decoration: none;
      padding: 8px 10px;
      border-radius: 4px;
      font-size: 14px;
    }
    .sidebar a.activo, .sidebar a:hover { background: #26374f; color: white; }
    .separador { color: #78909c; font-size: 11px; text-transform: uppercase; margin: 16px 0 4px 10px; }
    .main { flex: 1; display: flex; flex-direction: column; }
    .topbar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 16px;
      padding: 12px 24px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      font-size: 14px;
    }
    .topbar button {
      padding: 6px 12px;
      border: 1px solid #ccc;
      border-radius: 4px;
      background: white;
      cursor: pointer;
    }
    .contenido { padding: 24px; background: #f4f5f7; flex: 1; }
  `]
})
export class DashboardComponent {
  auth = inject(AuthService);
}
