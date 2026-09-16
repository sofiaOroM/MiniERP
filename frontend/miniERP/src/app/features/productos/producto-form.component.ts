import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductoService, CategoriaService } from '../../core/services/producto.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Categoria, ProductoRequest } from '../../core/models/producto.model';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>{{ productoId() ? 'Editar producto' : 'Nuevo producto' }}</h1>
    </div>

    <form class="form-card" [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>
        Código
        <input type="text" formControlName="codigo" />
      </label>

      <label>
        Nombre
        <input type="text" formControlName="nombre" />
      </label>

      <label>
        Descripción
        <textarea formControlName="descripcion" rows="2"></textarea>
      </label>

      <label>
        Categoría
        <select formControlName="categoriaId">
          <option [ngValue]="null" disabled>Selecciona una categoría</option>
          @for (c of categorias(); track c.id) {
            <option [ngValue]="c.id">{{ c.nombre }}</option>
          }
        </select>
      </label>

      <label>
        Unidad de medida
        <input type="text" formControlName="unidadMedida" />
      </label>

      <label>
        Precio de venta (Q)
        <input type="number" step="0.01" formControlName="precioVenta" />
      </label>

      <label>
        Costo de referencia (Q)
        <input type="number" step="0.01" formControlName="costoReferencia" />
      </label>

      <label>
        Stock mínimo
        <input type="number" formControlName="stockMinimo" />
      </label>

      <div class="form-actions">
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid || guardando()">
          {{ guardando() ? 'Guardando...' : 'Guardar' }}
        </button>
        <button class="btn btn-secondary" type="button" (click)="cancelar()">Cancelar</button>
      </div>
    </form>
  `
})
export class ProductoFormComponent {
  private fb = inject(FormBuilder);
  private productoService = inject(ProductoService);
  private categoriaService = inject(CategoriaService);
  private notificacion = inject(NotificacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  categorias = signal<Categoria[]>([]);
  guardando = signal(false);
  productoId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    codigo: ['', Validators.required],
    nombre: ['', Validators.required],
    descripcion: [''],
    categoriaId: [null as number | null, Validators.required],
    unidadMedida: ['UNIDAD', Validators.required],
    precioVenta: [0, [Validators.required, Validators.min(0.01)]],
    costoReferencia: [0, [Validators.required, Validators.min(0)]],
    stockMinimo: [5, [Validators.required, Validators.min(0)]]
  });

  constructor() {
    this.categoriaService.listar().subscribe((data) => this.categorias.set(data));

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.productoId.set(id);
      this.productoService.obtener(id).subscribe((p) => {
        this.form.patchValue({
          codigo: p.codigo,
          nombre: p.nombre,
          descripcion: p.descripcion ?? '',
          categoriaId: p.categoriaId,
          unidadMedida: p.unidadMedida,
          precioVenta: p.precioVenta,
          costoReferencia: p.costoReferencia,
          stockMinimo: p.stockMinimo
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.guardando.set(true);
    const valor = this.form.getRawValue();
    const payload: ProductoRequest = { ...valor, categoriaId: valor.categoriaId as number };

    const request$ = this.productoId()
      ? this.productoService.actualizar(this.productoId()!, payload)
      : this.productoService.crear(payload);

    request$.subscribe({
      next: () => {
        this.notificacion.exito('Producto guardado correctamente.');
        this.router.navigate(['/productos']);
      },
      error: () => this.guardando.set(false)
    });
  }

  cancelar(): void {
    this.router.navigate(['/productos']);
  }
}
