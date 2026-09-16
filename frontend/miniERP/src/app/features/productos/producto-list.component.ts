import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../core/services/producto.service';
import { AuthService } from '../../core/services/auth.service';
import { ConfirmDialogService } from '../../shared/confirm-dialog/confirm-dialog.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ProductoResponse } from '../../core/models/producto.model';

@Component({
  selector: 'app-producto-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <h1>Productos</h1>
      @if (auth.tienePermiso(['ADMINISTRACION'])) {
        <a class="btn btn-primary" routerLink="/productos/nuevo">+ Nuevo producto</a>
      }
    </div>

    <input type="text" placeholder="Buscar por código, nombre o categoría..."
           [ngModel]="filtro()" (ngModelChange)="filtro.set($event)"
           style="margin-bottom:16px; padding:8px; width:320px; border:1px solid #ccc; border-radius:4px;" />

    <table class="data-table">
      <thead>
      <tr>
        <th>Código</th><th>Nombre</th><th>Categoría</th><th>Precio</th>
        <th>Existencia</th><th>Costeo</th><th>Estado</th>
        @if (auth.tienePermiso(['ADMINISTRACION'])) { <th>Acciones</th> }
      </tr>
      </thead>
      <tbody>
        @for (p of filtrados(); track p.id) {
          <tr>
            <td>{{ p.codigo }}</td>
            <td>{{ p.nombre }}</td>
            <td>{{ p.categoria }}</td>
            <td>Q {{ p.precioVenta.toFixed(2) }}</td>
            <td>
              {{ p.existenciaActual }}
              @if (p.existenciaActual <= p.stockMinimo) {
                <span class="badge badge-warn">Bajo mínimo</span>
              }
            </td>
            <td>{{ p.metodoCosteo }}</td>
            <td>
              <span class="badge" [class.badge-ok]="p.activo" [class.badge-danger]="!p.activo">
                {{ p.activo ? 'Activo' : 'Inactivo' }}
              </span>
            </td>
            @if (auth.tienePermiso(['ADMINISTRACION'])) {
              <td class="acciones">
                <a class="btn btn-secondary" [routerLink]="['/productos', p.id, 'editar']">Editar</a>
                <button class="btn btn-danger" type="button" (click)="eliminar(p)">Eliminar</button>
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  `
})
export class ProductoListComponent {
  private productoService = inject(ProductoService);
  private confirmDialog = inject(ConfirmDialogService);
  private notificacion = inject(NotificacionService);
  auth = inject(AuthService);

  productos = signal<ProductoResponse[]>([]);
  filtro = signal('');

  filtrados = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.productos();
    return this.productos().filter((p) =>
      p.codigo.toLowerCase().includes(texto) ||
      p.nombre.toLowerCase().includes(texto) ||
      p.categoria.toLowerCase().includes(texto)
    );
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.productoService.listar().subscribe((data) => this.productos.set(data));
  }

  eliminar(p: ProductoResponse): void {
    if (!this.confirmDialog.confirmar(`¿Desactivar el producto "${p.nombre}"?`)) return;
    this.productoService.eliminar(p.id).subscribe(() => {
      this.notificacion.exito('Producto desactivado.');
      this.cargar();
    });
  }
}
