export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface AjusteInventarioRequest {
  productoId: number;
  sentido: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  motivo: string;
}

export interface DesgloseLote {
  loteId: number;
  cantidad: number;
  costoUnitario: number;
}

export interface MovimientoResponse {
  id: number;
  producto: string;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  costoUnitario: number;
  saldoCantidad: number;
  saldoValor: number;
  origen: string; // "Compra FC-1001" | "Venta FAC-2003" | "Ajuste manual"
  motivoAjuste: string | null;
  fecha: string; // ISO
  usuario: string;
  lotes: DesgloseLote[];
}
