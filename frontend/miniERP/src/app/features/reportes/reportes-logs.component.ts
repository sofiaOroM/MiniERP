import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { ReportesService, LogResponse } from '../../core/services/reporte.service';

const MODULOS = ['', 'PRODUCTOS', 'PROVEEDORES', 'COMPRAS', 'CLIENTES', 'VENTAS', 'INVENTARIO', 'USUARIOS'];

@Component({
  selector: 'app-reportes-logs',
  standalone: true,
  imports: [FormsModule, SlicePipe],
  template: `
    <div class="page-header"><h1>Logs de auditoría</h1></div>

    <label style="margin-bottom:16px; display:block; max-width:240px;">
      Filtrar por módulo
      <select [(ngModel)]="moduloSeleccionado" (ngModelChange)="cargar()">
        @for (m of modulos; track m) {
          <option [value]="m">{{ m === '' ? 'Todos' : m }}</option>
        }
      </select>
    </label>

    <table class="data-table">
      <thead><tr><th>Fecha</th><th>Usuario</th><th>Módulo</th><th>Acción</th><th>Descripción</th></tr></thead>
      <tbody>
        @for (log of logs(); track log.id) {
          <tr>
            <td>{{ log.fecha | slice:0:19 }}</td>
            <td>{{ log.usuario.nombre }} ({{ log.usuario.username }})</td>
            <td>{{ log.modulo }}</td>
            <td>{{ log.accion }}</td>
            <td>{{ log.descripcion }}</td>
          </tr>
        }
      </tbody>
    </table>
  `
})
export class ReportesLogsComponent {
  private reportesService = inject(ReportesService);

  logs = signal<LogResponse[]>([]);
  modulos = MODULOS;
  moduloSeleccionado = '';

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.reportesService
      .logs(this.moduloSeleccionado || undefined)
      .subscribe((data) => this.logs.set(data));
  }
}
