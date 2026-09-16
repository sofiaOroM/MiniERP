import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProveedorService } from '../../core/services/proveedor.service';
import { NotificacionService } from '../../core/services/notificacion.service';

@Component({
  selector: 'app-proveedor-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>{{ proveedorId() ? 'Editar proveedor' : 'Nuevo proveedor' }}</h1>
    </div>

    <form class="form-card" [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>Nombre <input type="text" formControlName="nombre" /></label>
      <label>NIT <input type="text" formControlName="nit" /></label>
      <label>Teléfono <input type="text" formControlName="telefono" /></label>
      <label>Dirección <input type="text" formControlName="direccion" /></label>
      <label>Email <input type="email" formControlName="email" /></label>

      <div class="form-actions">
        <button class="btn btn-primary" type="submit" [disabled]="form.invalid || guardando()">
          {{ guardando() ? 'Guardando...' : 'Guardar' }}
        </button>
        <button class="btn btn-secondary" type="button" (click)="cancelar()">Cancelar</button>
      </div>
    </form>
  `
})
export class ProveedorFormComponent {
  private fb = inject(FormBuilder);
  private proveedorService = inject(ProveedorService);
  private notificacion = inject(NotificacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  guardando = signal(false);
  proveedorId = signal<number | null>(null);

  form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    nit: ['', Validators.required],
    telefono: [''],
    direccion: [''],
    email: ['', Validators.email]
  });

  constructor() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.proveedorId.set(id);
      this.proveedorService.obtener(id).subscribe((p) => {
        this.form.patchValue({
          nombre: p.nombre, nit: p.nit, telefono: p.telefono ?? '',
          direccion: p.direccion ?? '', email: p.email ?? ''
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.guardando.set(true);
    const valor = this.form.getRawValue();

    const request$ = this.proveedorId()
      ? this.proveedorService.actualizar(this.proveedorId()!, valor)
      : this.proveedorService.crear(valor);

    request$.subscribe({
      next: () => {
        this.notificacion.exito('Proveedor guardado correctamente.');
        this.router.navigate(['/proveedores']);
      },
      error: () => this.guardando.set(false)
    });
  }

  cancelar(): void {
    this.router.navigate(['/proveedores']);
  }
}
