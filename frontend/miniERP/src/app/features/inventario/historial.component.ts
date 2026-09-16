import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { InventarioService } from '../../core/services/inventario.service';
import { ProductoService } from '../../core/services/producto.service';
import { MovimientoResponse } from '../../core/models/inventario.model';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [SlicePipe],
  template: `
    <div class="page-header">
      <h1>Historial de inventario @if (nombreProducto()) { — {{ nombreProducto() }} }</h1>
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th>Fecha</th><th>Tipo</th><th>Cantidad</th><th>Costo unit.</th>
          <th>Saldo cant.</th><th>Saldo valor</th><th>Origen</th><th>Usuario</th><th>Lotes</th>
        </tr>
      </thead>
      <tbody>
        @for (m of movimientos(); track m.id) {
          <tr>
            <td>{{ m.fecha | slice:0:16 }}</td>
            <td>
              <span class="badge" [class.badge-ok]="m.tipoMovimiento==='ENTRADA'" [class.badge-danger]="m.tipoMovimiento==='SALIDA'">
                {{ m.tipoMovimiento }}
              </span>
            </td>
            <td>{{ m.cantidad }}</td>
            <td>Q {{ m.costoUnitario.toFixed(2) }}</td>
            <td>{{ m.saldoCantidad }}</td>
            <td>Q {{ m.saldoValor.toFixed(2) }}</td>
            <td>{{ m.origen }} @if (m.motivoAjuste) { — {{ m.motivoAjuste }} }</td>
            <td>{{ m.usuario }}</td>
            <td>
              @for (l of m.lotes; track l.loteId) {
                <div>Lote #{{ l.loteId }}: {{ l.cantidad }} u. a Q{{ l.costoUnitario.toFixed(2) }}</div>
              }
            </td>
          </tr>
        }
      </tbody>
    </table>
  `
})
export class HistorialComponent {
  private inventarioService = inject(InventarioService);
  private productoService = inject(ProductoService);
  private route = inject(ActivatedRoute);

  movimientos = signal<MovimientoResponse[]>([]);
  nombreProducto = signal<string | null>(null);

  constructor() {
    const productoId = Number(this.route.snapshot.paramMap.get('productoId'));
    this.inventarioService.historial(productoId).subscribe((data) => this.movimientos.set(data));
    this.productoService.obtener(productoId).subscribe((p) => this.nombreProducto.set(p.nombre));
  }
}
