export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
}

export type MetodoCosteo = 'UEPS' | 'PEPS';

export interface ProductoResponse {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoriaId: number;
  categoria: string;
  unidadMedida: string;
  precioVenta: number;
  costoReferencia: number;
  stockMinimo: number;
  existenciaActual: number;
  metodoCosteo: MetodoCosteo;
  activo: boolean;
}

export interface ProductoRequest {
  codigo: string;
  nombre: string;
  descripcion: string | null;
  categoriaId: number;
  unidadMedida: string;
  precioVenta: number;
  costoReferencia: number;
  stockMinimo: number;
}
