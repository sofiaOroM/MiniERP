import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ReportesService, FilaTop } from '../../core/services/reporte.service';
import { ProductoResponse } from '../../core/models/producto.model';

@Component({
  selector: 'app-reportes-productos',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page-header"><h1>Reportes de productos / inventario</h1></div>

    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
      <section>
        <h2 style="font-size:15px;">Top 10 productos más vendidos</h2>
        <table class="data-table">
          <thead><tr><th>Producto</th><th>Unidades vendidas</th></tr></thead>
          <tbody>
            @for (fila of topVendidos(); track fila[0]) {
              <tr><td>{{ fila[1] }}</td><td>{{ fila[2] }}</td></tr>
            }
          </tbody>
        </table>
      </section>

      <section>
        <h2 style="font-size:15px;">Productos con menor existencia</h2>
        <table class="data-table">
          <thead><tr><th>Producto</th><th>Existencia</th><th>Mínimo</th><th></th></tr></thead>
          <tbody>
            @for (p of menorExistencia(); track p.id) {
              <tr>
                <td>{{ p.nombre }}</td>
                <td><span class="badge badge-warn">{{ p.existenciaActual }}</span></td>
                <td>{{ p.stockMinimo }}</td>
                <td><a [routerLink]="['/inventario', p.id, 'historial']">Ver historial</a></td>
              </tr>
            }
          </tbody>
        </table>
      </section>

      <section style="grid-column: 1 / -1;">
        <h2 style="font-size:15px;">Productos con más movimientos</h2>
        <table class="data-table">
          <thead><tr><th>Producto</th><th>Cantidad de movimientos</th></tr></thead>
          <tbody>
            @for (fila of masMovimientos(); track fila[0]) {
              <tr><td>{{ fila[1] }}</td><td>{{ fila[2] }}</td></tr>
            }
          </tbody>
        </table>
      </section>
    </div>
  `
})
export class ReportesProductosComponent {
  private reportesService = inject(ReportesService);

  topVendidos = signal<FilaTop[]>([]);
  menorExistencia = signal<ProductoResponse[]>([]);
  masMovimientos = signal<FilaTop[]>([]);

  constructor() {
    this.reportesService.top10ProductosMasVendidos().subscribe((data) => this.topVendidos.set(data));
    this.reportesService.productosConMenorExistencia().subscribe((data) => this.menorExistencia.set(data));
    this.reportesService.productosConMasMovimientos().subscribe((data) => this.masMovimientos.set(data));
  }
}
