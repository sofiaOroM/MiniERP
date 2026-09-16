import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { VentaService } from '../../core/services/venta.service';
import { ClienteService } from '../../core/services/cliente.service';
import { ProductoService } from '../../core/services/producto.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Cliente } from '../../core/models/cliente.model';
import { ProductoResponse } from '../../core/models/producto.model';

@Component({
  selector: 'app-venta-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header"><h1>Nueva venta</h1></div>

    <form class="form-card" style="max-width: 820px;" [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>
        Cliente
        <select formControlName="clienteId">
          <option [ngValue]="null" disabled>Selecciona un cliente</option>
          @for (c of clientes(); track c.id) {
            <option [ngValue]="c.id">{{ c.nombre }} ({{ c.nit }})</option>
          }
        </select>
      </label>

      <h2 style="font-size:15px; margin: 8px 0 0;">Productos</h2>
      <table class="data-table">
        <thead><tr><th>Producto</th><th>Existencia</th><th>Cantidad</th><th>Precio</th><th>Subtotal</th><th></th></tr></thead>
        <tbody formArrayName="detalles">
          @for (linea of detalles.controls; track $index) {
            <tr [formGroupName]="$index">
              <td>
                <select formControlName="productoId">
                  <option [ngValue]="null" disabled>Producto</option>
                  @for (p of productos(); track p.id) {
                    <option [ngValue]="p.id">{{ p.codigo }} - {{ p.nombre }}</option>
                  }
                </select>
              </td>
              <td>{{ existenciaDe($index) }}</td>
              <td>
                <input type="number" formControlName="cantidad" min="1" style="width:80px;" />
                @if (excedeStock($index)) {
                  <div class="field-error">Excede la existencia disponible</div>
                }
              </td>
              <td>Q {{ precioDe($index).toFixed(2) }}</td>
              <td>Q {{ subtotalLinea($index).toFixed(2) }}</td>
              <td><button class="btn btn-danger" type="button" (click)="quitarLinea($index)">×</button></td>
            </tr>
          }
        </tbody>
      </table>
      <button class="btn btn-secondary" type="button" style="width:fit-content;" (click)="agregarLinea()">+ Agregar producto</button>

      <div style="text-align:right; font-size:14px; margin-top:8px;">
        <p>Subtotal: Q {{ subtotalGeneral().toFixed(2) }}</p>
        <p>IVA (12%): Q {{ ivaGeneral().toFixed(2) }}</p>
        <p><strong>Total: Q {{ totalGeneral().toFixed(2) }}</strong></p>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid || detalles.length === 0 || hayLineasConExceso() || guardando()">
          {{ guardando() ? 'Guardando...' : 'Registrar venta' }}
        </button>
        <button class="btn btn-secondary" type="button" (click)="router.navigate(['/ventas'])">Cancelar</button>
      </div>
    </form>
  `
})
export class VentaFormComponent {
  private fb = inject(FormBuilder);
  private ventaService = inject(VentaService);
  private clienteService = inject(ClienteService);
  private productoService = inject(ProductoService);
  private notificacion = inject(NotificacionService);
  router = inject(Router);

  clientes = signal<Cliente[]>([]);
  productos = signal<ProductoResponse[]>([]);
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    clienteId: [null as number | null, Validators.required],
    detalles: this.fb.array<FormGroup>([])
  });

  get detalles(): FormArray<FormGroup> {
    return this.form.get('detalles') as FormArray<FormGroup>;
  }

  constructor() {
    this.clienteService.listar().subscribe((data) => this.clientes.set(data));
    this.productoService.listar().subscribe((data) => this.productos.set(data));
    this.agregarLinea();
  }

  agregarLinea(): void {
    this.detalles.push(
      this.fb.nonNullable.group({
        productoId: [null as number | null, Validators.required],
        cantidad: [1, [Validators.required, Validators.min(1)]]
      })
    );
  }

  quitarLinea(index: number): void {
    this.detalles.removeAt(index);
  }

  private productoDe(index: number): ProductoResponse | undefined {
    const productoId = this.detalles.at(index).getRawValue().productoId;
    return this.productos().find((p) => p.id === productoId);
  }

  existenciaDe(index: number): number {
    return this.productoDe(index)?.existenciaActual ?? 0;
  }

  precioDe(index: number): number {
    return this.productoDe(index)?.precioVenta ?? 0;
  }

  excedeStock(index: number): boolean {
    const cantidad = this.detalles.at(index).getRawValue().cantidad ?? 0;
    return cantidad > this.existenciaDe(index);
  }

  hayLineasConExceso(): boolean {
    return this.detalles.controls.some((_, i) => this.excedeStock(i));
  }

  subtotalLinea(index: number): number {
    const cantidad = this.detalles.at(index).getRawValue().cantidad ?? 0;
    return cantidad * this.precioDe(index);
  }

  subtotalGeneral(): number {
    return this.detalles.controls.reduce((acc, _, i) => acc + this.subtotalLinea(i), 0);
  }

  ivaGeneral(): number {
    return this.subtotalGeneral() * 0.12;
  }

  totalGeneral(): number {
    return this.subtotalGeneral() + this.ivaGeneral();
  }

  onSubmit(): void {
    if (this.form.invalid || this.detalles.length === 0 || this.hayLineasConExceso()) return;
    this.guardando.set(true);

    const payload = {
      clienteId: this.form.getRawValue().clienteId,
      detalles: this.detalles.getRawValue().map((d) => ({ productoId: d["productoId"], cantidad: d["cantidad"] }))
    };

    this.ventaService.registrar(payload as any).subscribe({
      next: () => {
        this.notificacion.exito('Venta registrada y factura generada.');
        this.router.navigate(['/ventas']);
      },
      error: () => this.guardando.set(false)
    });
  }
}
