export interface Proveedor {
  id: number;
  nombre: string;
  nit: string;
  telefono: string | null;
  direccion: string | null;
  email: string | null;
  activo: boolean;
}

export type ProveedorRequest = Omit<Proveedor, 'id' | 'activo'>;
