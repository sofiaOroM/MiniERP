import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductoResponse } from '../models/producto.model';

// Los endpoints de agregación devuelven arreglos [id, nombre, valor] (Object[] en Java);
// se tipan como tuplas para que las tablas los consuman directo.
export type FilaTop = [number, string, number];

export interface LogResponse {
  id: number;
  usuario: { id: number; nombre: string; username: string };
  modulo: string;
  accion: string;
  descripcion: string | null;
  fecha: string;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/reportes`;

  // Productos / Inventario
  top10ProductosMasVendidos(): Observable<FilaTop[]> {
    return this.http.get<FilaTop[]>(`${this.base}/productos/top-vendidos`);
  }
  productosConMenorExistencia(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.base}/productos/menor-existencia`);
  }
  productosConMasMovimientos(): Observable<FilaTop[]> {
    return this.http.get<FilaTop[]>(`${this.base}/productos/mas-movimientos`);
  }

  // Compras / Proveedores
  top5ProveedoresPorMonto(): Observable<FilaTop[]> {
    return this.http.get<FilaTop[]>(`${this.base}/proveedores/top-monto`);
  }
  productosAdquiridosConMasFrecuencia(): Observable<FilaTop[]> {
    return this.http.get<FilaTop[]>(`${this.base}/compras/productos-mas-frecuentes`);
  }

  // Ventas / Clientes
  top10ClientesPorMonto(): Observable<FilaTop[]> {
    return this.http.get<FilaTop[]>(`${this.base}/clientes/top-monto`);
  }
  top10ProductosPorIngresos(): Observable<FilaTop[]> {
    return this.http.get<FilaTop[]>(`${this.base}/productos/top-ingresos`);
  }
  resumenVentasPorPeriodo(): Observable<[string, number, number][]> {
    return this.http.get<[string, number, number][]>(`${this.base}/ventas/resumen-periodo`);
  }

  // Logs
  logs(modulo?: string): Observable<LogResponse[]> {
    return this.http.get<LogResponse[]>(`${this.base}/logs`, {
      params: modulo ? { modulo } : {}
    });
  }
}
