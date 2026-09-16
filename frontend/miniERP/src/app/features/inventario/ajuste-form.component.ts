import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InventarioService } from '../../core/services/inventario.service';
import { ProductoService } from '../../core/services/producto.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { ProductoResponse } from '../../core/models/producto.model';
import { AjusteInventarioRequest } from '../../core/models/inventario.model';

@Component({
  selector: 'app-ajuste-form',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="page-header"><h1>Ajuste manual de inventario</h1></div>

    <form class="form-card" [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>
        Producto
        <select formControlName="productoId">
          <option [ngValue]="null" disabled>Selecciona un producto</option>
          @for (p of productos(); track p.id) {
            <option [ngValue]="p.id">{{ p.codigo }} - {{ p.nombre }} (existencia: {{ p.existenciaActual }})</option>
          }
        </select>
      </label>

      <label>
        Sentido del ajuste
        <select formControlName="sentido">
          <option value="ENTRADA">Entrada (aumenta existencias)</option>
          <option value="SALIDA">Salida (disminuye existencias)</option>
        </select>
      </label>

      <label>
        Cantidad
        <input type="number" formControlName="cantidad" min="1" />
      </label>

      @if (productoSeleccionado() && form.getRawValue().sentido === 'SALIDA' && (form.getRawValue().cantidad ?? 0) > productoSeleccionado()!.existenciaActual) {
        <p class="field-error">
          La cantidad excede la existencia disponible ({{ productoSeleccionado()!.existenciaActual }}).
        </p>
      }

      <label>
        Motivo
        <textarea formControlName="motivo" rows="2" placeholder="Ej. conteo físico, producto dañado, merma..."></textarea>
      </label>

      <div class="form-actions">
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid || guardando()">
          {{ guardando() ? 'Guardando...' : 'Registrar ajuste' }}
        </button>
        <a class="btn btn-secondary" routerLink="/inicio">Cancelar</a>
      </div>
    </form>

    @if (movimientoRegistrado()) {
      <div class="form-card" style="margin-top:16px; max-width: 640px;">
        <h2 style="margin:0; font-size:15px;">Movimiento registrado</h2>
        <p>Nuevo saldo: {{ movimientoRegistrado()!.saldoCantidad }} unidades (Q {{ movimientoRegistrado()!.saldoValor.toFixed(2) }})</p>
        <a [routerLink]="['/inventario', ultimoProductoId(), 'historial']">Ver historial completo</a>
      </div>
    }
  `
})
export class AjusteFormComponent {
  private fb = inject(FormBuilder);
  private inventarioService = inject(InventarioService);
  private productoService = inject(ProductoService);
  private notificacion = inject(NotificacionService);

  productos = signal<ProductoResponse[]>([]);
  guardando = signal(false);
  movimientoRegistrado = signal<{ saldoCantidad: number; saldoValor: number } | null>(null);
  ultimoProductoId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    productoId: [null as number | null, Validators.required],
    sentido: ['ENTRADA' as 'ENTRADA' | 'SALIDA', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    motivo: ['', Validators.required]
  });

  constructor() {
    this.productoService.listar().subscribe((data) => this.productos.set(data));
  }

  productoSeleccionado(): ProductoResponse | undefined {
    const id = this.form.getRawValue().productoId;
    return this.productos().find((p) => p.id === id);
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const valor = this.form.getRawValue();
    if (valor.sentido === 'SALIDA') {
      const producto = this.productoSeleccionado();
      if (producto && valor.cantidad > producto.existenciaActual) return; // el botón ya se deshabilita, doble resguardo
    }

    this.guardando.set(true);
    const payload: AjusteInventarioRequest = {
      productoId: valor.productoId as number,
      sentido: valor.sentido,
      cantidad: valor.cantidad,
      motivo: valor.motivo
    };

    this.inventarioService.registrarAjuste(payload).subscribe({
      next: (mov) => {
        this.notificacion.exito('Ajuste registrado correctamente.');
        this.movimientoRegistrado.set({ saldoCantidad: mov.saldoCantidad, saldoValor: mov.saldoValor });
        this.ultimoProductoId.set(payload.productoId);
        this.guardando.set(false);
        this.form.reset({ sentido: 'ENTRADA', cantidad: 1, productoId: null, motivo: '' });
        this.productoService.listar().subscribe((data) => this.productos.set(data)); // refresca existencias
      },
      error: () => this.guardando.set(false)
    });
  }
}
