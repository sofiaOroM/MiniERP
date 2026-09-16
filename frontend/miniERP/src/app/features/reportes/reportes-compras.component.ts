import { Component, inject, signal } from '@angular/core';
import { ReportesService, FilaTop } from '../../core/services/reporte.service';

@Component({
  selector: 'app-reportes-compras',
  standalone: true,
  template: `
    <div class="page-header"><h1>Reportes de compras / proveedores</h1></div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
      <section>
        <h2 style="font-size:15px;">Top 5 proveedores por monto acumulado</h2>
        <table class="data-table">
          <thead><tr><th>Proveedor</th><th>Monto total</th></tr></thead>
          <tbody>
            @for (fila of topProveedores(); track fila[0]) {
              <tr><td>{{ fila[1] }}</td><td>Q {{ fila[2].toFixed(2) }}</td></tr>
            }
          </tbody>
        </table>
      </section>

      <section>
        <h2 style="font-size:15px;">Productos adquiridos con más frecuencia</h2>
        <table class="data-table">
          <thead><tr><th>Producto</th><th>Cantidad total adquirida</th></tr></thead>
          <tbody>
            @for (fila of productosFrecuentes(); track fila[0]) {
              <tr><td>{{ fila[1] }}</td><td>{{ fila[2] }}</td></tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `
})
export class ReportesComprasComponent {
  private reportesService = inject(ReportesService);

  topProveedores = signal<FilaTop[]>([]);
  productosFrecuentes = signal<FilaTop[]>([]);

  constructor() {
    this.reportesService.top5ProveedoresPorMonto().subscribe((data) => this.topProveedores.set(data));
    this.reportesService.productosAdquiridosConMasFrecuencia().subscribe((data) => this.productosFrecuentes.set(data));
  }
}
