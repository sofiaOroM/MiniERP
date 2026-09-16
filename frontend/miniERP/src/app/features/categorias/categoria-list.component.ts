import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CategoriaService } from '../../core/services/producto.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificacionService } from '../../core/services/notificacion.service';
import { Categoria } from '../../core/models/producto.model';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header"><h1>Categorías</h1></div>

    <table class="data-table">
      <thead><tr><th>Nombre</th><th>Descripción</th></tr></thead>
      <tbody>
        @for (c of categorias(); track c.id) {
          <tr><td>{{ c.nombre }}</td><td>{{ c.descripcion }}</td></tr>
        }
      </tbody>
    </table>

    @if (auth.tienePermiso(['ADMINISTRACION'])) {
      <form class="form-card" style="margin-top: 20px; max-width: 420px;" [formGroup]="form" (ngSubmit)="crear()">
        <h2 style="margin:0; font-size:16px;">Nueva categoría</h2>
        <label>Nombre <input type="text" formControlName="nombre" /></label>
        <label>Descripción <input type="text" formControlName="descripcion" /></label>
        <div class="form-actions">
          <button class="btn btn-primary" type="submit" [disabled]="form.invalid">Agregar</button>
        </div>
      </form>
    }
  `
})
export class CategoriaListComponent {
  private categoriaService = inject(CategoriaService);
  private notificacion = inject(NotificacionService);
  private fb = inject(FormBuilder);
  auth = inject(AuthService);

  categorias = signal<Categoria[]>([]);
  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.categoriaService.listar().subscribe((data) => this.categorias.set(data));
  }

  crear(): void {
    if (this.form.invalid) return;
    this.categoriaService.crear(this.form.getRawValue()).subscribe(() => {
      this.notificacion.exito('Categoría creada.');
      this.form.reset();
      this.cargar();
    });
  }
}
