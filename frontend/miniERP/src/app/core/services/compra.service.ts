import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CompraRequest, CompraResponse } from '../models/compra.model';

@Injectable({ providedIn: 'root' })
export class CompraService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/compras`;

  registrar(req: CompraRequest): Observable<CompraResponse> {
    return this.http.post<CompraResponse>(this.base, req);
  }

  buscarPorFechas(desde: string, hasta: string): Observable<CompraResponse[]> {
    return this.http.get<CompraResponse[]>(this.base, { params: { desde, hasta } });
  }
}
