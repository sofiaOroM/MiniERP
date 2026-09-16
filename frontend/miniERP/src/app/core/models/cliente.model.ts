export interface Cliente {
  id: number;
  nombre: string;
  nit: string; // usar "CF" para consumidor final
  telefono: string | null;
  direccion: string | null;
  email: string | null;
  activo: boolean;
}

export type ClienteRequest = Omit<Cliente, 'id' | 'activo'>;
