import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { VentaRequest, VentaResponse } from '../models/venta.model';

@Injectable({ providedIn: 'root' })
export class VentaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/ventas`;

  registrar(req: VentaRequest): Observable<VentaResponse> {
    return this.http.post<VentaResponse>(this.base, req);
  }

  buscarPorFechas(desde: string, hasta: string): Observable<VentaResponse[]> {
    return this.http.get<VentaResponse[]>(this.base, { params: { desde, hasta } });
  }

  /** El backend resuelve la ruta real del archivo desde la base de datos;
   *  aquí solo se pide por id, nunca se manda una ruta de archivo del cliente. */
  descargarFacturaBlob(id: number): Observable<Blob> {
    return this.http.get(`${this.base}/${id}/factura`, { responseType: 'blob' });
  }
}
