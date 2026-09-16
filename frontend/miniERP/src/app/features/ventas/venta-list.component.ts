import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { VentaService } from '../../core/services/venta.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { VentaResponse } from '../../core/models/venta.model';

@Component({
  selector: 'app-venta-list',
  standalone: true,
  imports: [RouterLink, FormsModule, SlicePipe],
  template: `
    <div class="page-header">
      <h1>Ventas</h1>
      @if (auth.tienePermiso(['ADMINISTRACION','VENTAS'])) {
        <a class="btn btn-primary" routerLink="/ventas/nueva">+ Nueva venta</a>
      }
    </div>

    <div style="display:flex; gap:12px; align-items:end; margin-bottom:16px; flex-wrap:wrap;">
      <label>Desde <input type="date" [(ngModel)]="desde" /></label>
      <label>Hasta <input type="date" [(ngModel)]="hasta" /></label>
      <button class="btn btn-secondary" type="button" (click)="buscar()">Filtrar</button>
      <input type="text" placeholder="Buscar por no. factura o cliente..."
             [ngModel]="filtro()" (ngModelChange)="filtro.set($event)"
             style="padding:8px; width:280px; border:1px solid #ccc; border-radius:4px;" />
    </div>

    <table class="data-table">
      <thead><tr><th>Factura</th><th>Cliente</th><th>Fecha</th><th>Total</th><th>Factura PDF</th></tr></thead>
      <tbody>
        @for (v of filtradas(); track v.id) {
          <tr>
            <td>{{ v.numeroFactura }}</td>
            <td>{{ v.clienteNombre }}</td>
            <td>{{ v.fecha | slice:0:16 }}</td>
            <td>Q {{ v.total.toFixed(2) }}</td>
            <td>
              @if (v.pdfPath && auth.tienePermiso(['ADMINISTRACION','VENTAS'])) {
                <button class="btn btn-secondary" type="button" (click)="descargar(v)">Descargar</button>
              }
            </td>
          </tr>
        }
      </tbody>
    </table>
  `
})
export class VentaListComponent {
  private ventaService = inject(VentaService);
  private notificacion = inject(NotificacionService);
  auth = inject(AuthService);

  ventas = signal<VentaResponse[]>([]);
  filtro = signal('');
  desde = this.primerDiaDelMes();
  hasta = this.hoy();

  filtradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.ventas();
    return this.ventas().filter((v) =>
      v.numeroFactura.toLowerCase().includes(texto) ||
      v.clienteNombre.toLowerCase().includes(texto)
    );
  });

  constructor() {
    this.buscar();
  }

  buscar(): void {
    this.ventaService
      .buscarPorFechas(`${this.desde}T00:00:00`, `${this.hasta}T23:59:59`)
      .subscribe((data) => this.ventas.set(data));
  }

  descargar(v: VentaResponse): void {
    if (!v.pdfPath) return;
    this.ventaService.descargarFacturaBlob(v.id).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
      },
      error: () => this.notificacion.error('No se pudo descargar la factura.')
    });
  }

  private hoy(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private primerDiaDelMes(): string {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().slice(0, 10);
  }
}
