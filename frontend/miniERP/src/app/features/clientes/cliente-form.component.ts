import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteService } from '../../core/services/cliente.service';
import { NotificacionService } from '../../core/services/notificacion.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="page-header">
      <h1>{{ clienteId() ? 'Editar cliente' : 'Nuevo cliente' }}</h1>
    </div>

    <form class="form-card" [formGroup]="form" (ngSubmit)="onSubmit()">
      <label>Nombre <input type="text" formControlName="nombre" /></label>
      <label>
        NIT <input type="text" formControlName="nit" placeholder="Usa 'CF' para consumidor final" />
      </label>
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
export class ClienteFormComponent {
  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);
  private notificacion = inject(NotificacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  guardando = signal(false);
  clienteId = signal<number | null>(null);

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
      this.clienteId.set(id);
      this.clienteService.obtener(id).subscribe((c) => {
        this.form.patchValue({
          nombre: c.nombre, nit: c.nit, telefono: c.telefono ?? '',
          direccion: c.direccion ?? '', email: c.email ?? ''
        });
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) return;
    this.guardando.set(true);
    const valor = this.form.getRawValue();

    const request$ = this.clienteId()
      ? this.clienteService.actualizar(this.clienteId()!, valor)
      : this.clienteService.crear(valor);

    request$.subscribe({
      next: () => {
        this.notificacion.exito('Cliente guardado correctamente.');
        this.router.navigate(['/clientes']);
      },
      error: () => this.guardando.set(false)
    });
  }

  cancelar(): void {
    this.router.navigate(['/clientes']);
  }
}
