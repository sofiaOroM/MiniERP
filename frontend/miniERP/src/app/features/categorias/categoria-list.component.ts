import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CategoriaService } from '../../core/services/producto.service';
import { AuthService } from '../../core/services/auth.service';
import { Categoria } from '../../core/models/producto.model';

@Component({
  selector: 'app-categoria-list',
  standalone: true,
  imports: [RouterLink, FormsModule],
  template: `
    <div class="page-header">
      <h1>Categorías</h1>
      @if (auth.tienePermiso(['ADMINISTRACION'])) {
        <a class="btn btn-primary" routerLink="/categorias/nueva">+ Nueva categoría</a>
      }
    </div>

    <input type="text" placeholder="Buscar por nombre o descripción..."
           [ngModel]="filtro()" (ngModelChange)="filtro.set($event)"
           style="margin-bottom:16px; padding:8px; width:320px; border:1px solid #ccc; border-radius:4px;" />

    <table class="data-table">
      <thead>
      <tr>
        <th>Nombre</th><th>Descripción</th>
        @if (auth.tienePermiso(['ADMINISTRACION'])) { <th>Acciones</th> }
      </tr>
      </thead>
      <tbody>
        @for (c of filtradas(); track c.id) {
          <tr>
            <td>{{ c.nombre }}</td>
            <td>{{ c.descripcion }}</td>
            @if (auth.tienePermiso(['ADMINISTRACION'])) {
              <td class="acciones">
                <a class="btn btn-secondary" [routerLink]="['/categorias', c.id, 'editar']">Editar</a>
              </td>
            }
          </tr>
        }
      </tbody>
    </table>
  `
})
export class CategoriaListComponent {
  private categoriaService = inject(CategoriaService);
  auth = inject(AuthService);

  categorias = signal<Categoria[]>([]);
  filtro = signal('');

  filtradas = computed(() => {
    const texto = this.filtro().trim().toLowerCase();
    if (!texto) return this.categorias();
    return this.categorias().filter((c) =>
      c.nombre.toLowerCase().includes(texto) || (c.descripcion ?? '').toLowerCase().includes(texto)
    );
  });

  constructor() {
    this.cargar();
  }

  cargar(): void {
    this.categoriaService.listar().subscribe((data) => this.categorias.set(data));
  }
}
