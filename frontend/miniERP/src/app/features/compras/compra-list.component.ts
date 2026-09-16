import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { CompraService } from '../../core/services/compra.service';
import { AuthService } from '../../core/services/auth.service';
import { CompraResponse } from '../../core/models/compra.model';

@Component({
  selector: 'app-compra-list',
  standalone: true,
  imports: [RouterLink, FormsModule, SlicePipe],
  template: `
    <div class="page-header">
      <h1>Compras</h1>
      @if (auth.tienePermiso(['ADMINISTRACION','COMPRAS'])) {
        <a class="btn btn-primary" routerLink="/compras/nueva">+ Nueva compra</a>
      }
    </div>

    <div style="display:flex; gap:12px; align-items:end; margin-bottom:16px; flex-wrap:wrap;">
      <label>Desde <input type="date" [(ngModel)]="desde" /></label>
      <label>Hasta <input type="date" [(ngModel)]="hasta" /></label>
      <button class="btn btn-secondary" type="button" (click)="buscar()">Filtrar</button>
      <input type="text" placeholder="Buscar por no. documento o proveedor..."
             [ngModel]="filtro()" (ngModelChange)="filtro.set($event)"
             style="padding:8px; width:280px; border:1px solid #ccc; border-radius:4px;" />
    </div>

    <table class="data-table">
      <thead><tr><th>No. Documento</th><th>Proveedor</th><th>Fecha</th><th>Subtotal</th><th>IVA</th><th>Total</th></tr></thead>
      <tbody>
        @for (c of filtradas(); track c.id) {
          <tr>
            <td>{{ c.numeroDocumento }}</td>
            <td>{{ c.proveedorNombre }}</td>
            <td>{{ c.fecha | slice:0:16 }}</td>
            <td>Q {{ c.subtotal.toFixed(2) }}</td>
            <td>Q {{ c.iva.toFixed(2) }}</td>
            <td>Q {{ c.total.toFixed(2) }}</td>
          </tr>
        }
      </tbody>
    </table>
  `
})
export class CompraListComponent {
  private compraService = inject(CompraService);
  auth = inject(AuthService);

  compras = signal<CompraResponse[]>([]);
  filtro = signal('');
  desde = this.primerDiaDelMes();
  hasta = this.hoy();

  filtradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.compras();
    return this.compras().filter((c) =>
      c.numeroDocumento.toLowerCase().includes(texto) ||
      c.proveedorNombre.toLowerCase().includes(texto)
    );
  });

  constructor() {
    this.buscar();
  }

  buscar(): void {
    this.compraService
      .buscarPorFechas(`${this.desde}T00:00:00`, `${this.hasta}T23:59:59`)
      .subscribe((data) => this.compras.set(data));
  }

  private hoy(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private primerDiaDelMes(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }
}
