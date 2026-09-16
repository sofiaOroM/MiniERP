import { Component, inject, signal } from '@angular/core';
import { ReportesService, FilaTop } from '../../core/services/reporte.service';

@Component({
  selector: 'app-reportes-ventas',
  standalone: true,
  template: `
    <div class="page-header"><h1>Reportes de ventas / clientes</h1></div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
      <section>
        <h2 style="font-size:15px;">Top 10 clientes por monto acumulado</h2>
        <table class="data-table">
          <thead><tr><th>Cliente</th><th>Monto total</th></tr></thead>
          <tbody>
            @for (fila of topClientes(); track fila[0]) {
              <tr><td>{{ fila[1] }}</td><td>Q {{ fila[2].toFixed(2) }}</td></tr>
            }
          </tbody>
        </table>
      </section>

      <section>
        <h2 style="font-size:15px;">Top 10 productos por ingresos generados</h2>
        <table class="data-table">
          <thead><tr><th>Producto</th><th>Ingresos</th></tr></thead>
          <tbody>
            @for (fila of topIngresos(); track fila[0]) {
              <tr><td>{{ fila[1] }}</td><td>Q {{ fila[2].toFixed(2) }}</td></tr>
            }
          </tbody>
        </table>
      </section>

      <section style="grid-column: 1 / -1;">
        <h2 style="font-size:15px;">Resumen de ventas por período</h2>
        <table class="data-table">
          <thead><tr><th>Período</th><th>Cantidad de ventas</th><th>Monto total</th></tr></thead>
          <tbody>
            @for (fila of resumenPeriodo(); track fila[0]) {
              <tr><td>{{ fila[0] }}</td><td>{{ fila[1] }}</td><td>Q {{ fila[2].toFixed(2) }}</td></tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `
})
export class ReportesVentasComponent {
  private reportesService = inject(ReportesService);

  topClientes = signal<FilaTop[]>([]);
  topIngresos = signal<FilaTop[]>([]);
  resumenPeriodo = signal<[string, number, number][]>([]);

  constructor() {
    this.reportesService.top10ClientesPorMonto().subscribe((data) => this.topClientes.set(data));
    this.reportesService.top10ProductosPorIngresos().subscribe((data) => this.topIngresos.set(data));
    this.reportesService.resumenVentasPorPeriodo().subscribe((data) => this.resumenPeriodo.set(data));
  }
}
