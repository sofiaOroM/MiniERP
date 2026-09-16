import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoriaService } from '../../core/services/producto.service';
import { NotificacionService } from '../../core/services/notificacion.service';

@Component({
  selector: 'app-categoria-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>{{ categoriaId() ? 'Editar categoría' : 'Nueva categoría' }}</h1>
    </div>

    <form class="form-card" style="max-width: 420px;" [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>Nombre <input type="text" formControlName="nombre" /></label>
      <label>Descripción <input type="text" formControlName="descripcion" /></label>

      <div class="form-actions">
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid || guardando()">
          {{ guardando() ? 'Guardando...' : 'Guardar' }}
        </button>
        <button class="btn btn-secondary" type="button" (click)="cancelar()">Cancelar</button>
      </div>
    </form>
  `
})
export class CategoriaFormComponent {
  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoriaService);
  private notificacion = inject(NotificacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  guardando = signal(false);
  categoriaId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: ['']
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.categoriaId.set(id);
      this.categoriaService.obtener(id).subscribe((c) => {
        this.form.patchValue({ nombre: c.nombre, descripcion: c.descripcion ?? '' });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.guardando.set(true);
    const valor = this.form.getRawValue();

    const request$ = this.categoriaId()
      ? this.categoriaService.actualizar(this.categoriaId()!, valor)
      : this.categoriaService.crear(valor);

    request$.subscribe({
      next: () => {
        this.notificacion.exito('Categoría guardada correctamente.');
        this.router.navigate(['/categorias']);
      },
      error: () => this.guardando.set(false)
    });
  }

  cancelar(): void {
    this.router.navigate(['/categorias']);
  }
}
