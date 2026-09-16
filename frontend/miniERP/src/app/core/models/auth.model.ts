export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  nombre: string;
  rol: 'ADMINISTRACION' | 'COMPRAS' | 'INVENTARIO' | 'VENTAS';
}

export interface SesionActual {
  token: string;
  username: string;
  nombre: string;
  rol: LoginResponse['rol'];
}
