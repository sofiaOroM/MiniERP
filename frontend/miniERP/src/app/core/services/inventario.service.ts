import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AjusteInventarioRequest, MovimientoResponse } from '../models/inventario.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/inventario`;

  historial(productoId: number): Observable<MovimientoResponse[]> {
    return this.http.get<MovimientoResponse[]>(`${this.base}/movimientos/${productoId}`);
  }

  registrarAjuste(req: AjusteInventarioRequest): Observable<MovimientoResponse> {
    return this.http.post<MovimientoResponse>(`${this.base}/ajustes`, req);
  }
}
