export type NombreRol = 'ADMINISTRACION' | 'COMPRAS' | 'INVENTARIO' | 'VENTAS';

export interface Rol {
  id: number;
  nombre: NombreRol;
  descripcion: string | null;
}

export interface UsuarioResponse {
  id: number;
  nombre: string;
  username: string;
  rol: NombreRol;
  activo: boolean;
}

export interface UsuarioRequest {
  nombre: string;
  username: string;
  password: string | null; // null al actualizar = no cambiar contraseña
  rolId: number;
}
