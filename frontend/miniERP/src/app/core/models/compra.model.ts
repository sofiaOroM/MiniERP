export interface CompraDetalleRequest {
  productoId: number;
  cantidad: number;
  precioUnitario: number;
}

export interface CompraRequest {
  proveedorId: number;
  numeroDocumento: string;
  detalles: CompraDetalleRequest[];
}

export interface CompraLineaResponse {
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CompraResponse {
  id: number;
  proveedorNombre: string;
  numeroDocumento: string;
  fecha: string; // ISO
  subtotal: number;
  iva: number;
  total: number;
  detalles: CompraLineaResponse[];
}
