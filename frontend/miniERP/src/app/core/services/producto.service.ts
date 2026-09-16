import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ProductoRequest, ProductoResponse, Categoria } from '../models/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/productos`;

  listar(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(this.base);
  }

  obtener(id: number): Observable<ProductoResponse> {
    return this.http.get<ProductoResponse>(`${this.base}/${id}`);
  }

  conExistenciaBaja(): Observable<ProductoResponse[]> {
    return this.http.get<ProductoResponse[]>(`${this.base}/existencia-baja`);
  }

  crear(req: ProductoRequest): Observable<ProductoResponse> {
    return this.http.post<ProductoResponse>(this.base, req);
  }

  actualizar(id: number, req: ProductoRequest): Observable<ProductoResponse> {
    return this.http.put<ProductoResponse>(`${this.base}/${id}`, req);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/categorias`;

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.base);
  }

  obtener(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.base}/${id}`);
  }

  crear(categoria: Omit<Categoria, 'id'>): Observable<Categoria> {
    return this.http.post<Categoria>(this.base, categoria);
  }

  actualizar(id: number, categoria: Omit<Categoria, 'id'>): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.base}/${id}`, categoria);
  }
}
