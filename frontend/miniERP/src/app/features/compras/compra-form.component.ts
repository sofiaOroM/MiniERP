import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CompraService } from '../../core/services/compra.service';
import { ProveedorService } from '../../core/services/proveedor.service';
import { ProductoService } from '../../core/services/producto.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Proveedor } from '../../core/models/proveedor.model';
import { ProductoResponse } from '../../core/models/producto.model';
import { CompraRequest } from '../../core/models/compra.model';

@Component({
  selector: 'app-compra-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header"><h1>Nueva compra</h1></div>

    <form class="form-card" style="max-width: 820px;" [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>
        Proveedor
        <select formControlName="proveedorId">
          <option [ngValue]="null" disabled>Selecciona un proveedor</option>
          @for (p of proveedores(); track p.id) {
            <option [ngValue]="p.id">{{ p.nombre }}</option>
          }
        </select>
      </label>

      <label>
        No. de documento
        <input type="text" formControlName="numeroDocumento" />
      </label>

      <h2 style="font-size:15px; margin: 8px 0 0;">Productos</h2>
      <table class="data-table">
        <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio unitario</th><th>Subtotal</th><th></th></tr></thead>
        <tbody formArrayName="detalles">
          @for (linea of detalles.controls; track $index) {
            <tr [formGroupName]="$index">
              <td>
                <select formControlName="productoId" (change)="autocompletarCosto($index)">
                  <option [ngValue]="null" disabled>Producto</option>
                  @for (p of productos(); track p.id) {
                    <option [ngValue]="p.id">{{ p.codigo }} - {{ p.nombre }}</option>
                  }
                </select>
              </td>
              <td><input type="number" formControlName="cantidad" min="1" style="width:80px;" /></td>
              <td><input type="number" formControlName="precioUnitario" step="0.01" style="width:110px;" /></td>
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
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid || detalles.length === 0 || guardando()">
          {{ guardando() ? 'Guardando...' : 'Registrar compra' }}
        </button>
        <button class="btn btn-secondary" type="button" (click)="router.navigate(['/compras'])">Cancelar</button>
      </div>
    </form>
  `
})
export class CompraFormComponent {
  private fb = inject(FormBuilder);
  private compraService = inject(CompraService);
  private proveedorService = inject(ProveedorService);
  private productoService = inject(ProductoService);
  private notificacion = inject(NotificacionService);
  router = inject(Router);

  proveedores = signal<Proveedor[]>([]);
  productos = signal<ProductoResponse[]>([]);
  guardando = signal(false);

  form = this.fb.nonNullable.group({
    proveedorId: [null as number | null, Validators.required],
    numeroDocumento: ['', Validators.required],
    detalles: this.fb.array<FormGroup>([])
  });

  get detalles(): FormArray<FormGroup> {
    return this.form.get('detalles') as FormArray<FormGroup>;
  }

  constructor() {
    this.proveedorService.listar().subscribe((data) => this.proveedores.set(data));
    this.productoService.listar().subscribe((data) => this.productos.set(data));
    this.agregarLinea();
  }

  agregarLinea(): void {
    this.detalles.push(
      this.fb.nonNullable.group({
        productoId: [null as number | null, Validators.required],
        cantidad: [1, [Validators.required, Validators.min(1)]],
        precioUnitario: [0, [Validators.required, Validators.min(0.01)]]
      })
    );
  }

  quitarLinea(index: number): void {
    this.detalles.removeAt(index);
  }

  autocompletarCosto(index: number): void {
    const productoId = this.detalles.at(index).get('productoId')?.value;
    const producto = this.productos().find((p) => p.id === productoId);
    if (producto) {
      this.detalles.at(index).patchValue({ precioUnitario: producto.costoReferencia });
    }
  }

  subtotalLinea(index: number): number {
    const linea = this.detalles.at(index).getRawValue();
    return (linea.cantidad ?? 0) * (linea.precioUnitario ?? 0);
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
    if (this.form.invalid || this.detalles.length === 0) return;
    this.guardando.set(true);

    const valor = this.form.getRawValue();
    const payload: CompraRequest = {
      proveedorId: valor.proveedorId as number,
      numeroDocumento: valor.numeroDocumento,
      detalles: valor.detalles.map((d) => ({
        productoId: d['productoId'] as number,
        cantidad: d['cantidad'] as number,
        precioUnitario: d['precioUnitario'] as number
      }))
    };

    this.compraService.registrar(payload).subscribe({
      next: () => {
        this.notificacion.exito('Compra registrada correctamente.');
        this.router.navigate(['/compras']);
      },
      error: () => this.guardando.set(false)
    });
  }
}
