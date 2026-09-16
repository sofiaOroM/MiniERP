export interface VentaDetalleRequest {
  productoId: number;
  cantidad: number;
  // el precio NO se envía: el backend lo toma del catálogo (evita manipulación desde el cliente)
}

export interface VentaRequest {
  clienteId: number;
  detalles: VentaDetalleRequest[];
}

export interface VentaLineaResponse {
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaResponse {
  id: number;
  clienteNombre: string;
  numeroFactura: string;
  fecha: string; // ISO
  subtotal: number;
  iva: number;
  total: number;
  pdfPath: string | null;
  detalles: VentaLineaResponse[];
}
