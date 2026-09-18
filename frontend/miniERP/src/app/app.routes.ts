import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

const TODOS = ['ADMINISTRACION', 'COMPRAS', 'INVENTARIO', 'VENTAS'];

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then((m) => m.LoginComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      {
        path: 'inicio',
        loadComponent: () => import('./features/dashboard/inicio.component').then((m) => m.InicioComponent)
      },

      // ---------- Productos / Categorías: lectura para todos, escritura ADMINISTRACION (se valida en el componente) ----------
      {
        path: 'productos',
        canActivate: [roleGuard(TODOS)],
        loadComponent: () => import('./features/productos/producto-list.component').then((m) => m.ProductoListComponent)
      },
      {
        path: 'productos/nuevo',
        canActivate: [roleGuard(['ADMINISTRACION'])],
        loadComponent: () => import('./features/productos/producto-form.component').then((m) => m.ProductoFormComponent)
      },
      {
        path: 'productos/:id/editar',
        canActivate: [roleGuard(['ADMINISTRACION'])],
        loadComponent: () => import('./features/productos/producto-form.component').then((m) => m.ProductoFormComponent)
      },
      {
        path: 'categorias',
        canActivate: [roleGuard(TODOS)],
        loadComponent: () => import('./features/categorias/categoria-list.component').then((m) => m.CategoriaListComponent)
      },
      {
        path: 'categorias/nueva',
        canActivate: [roleGuard(['ADMINISTRACION'])],
        loadComponent: () => import('./features/categorias/categoria-form.component').then((m) => m.CategoriaFormComponent)
      },
      {
        path: 'categorias/:id/editar',
        canActivate: [roleGuard(['ADMINISTRACION'])],
        loadComponent: () => import('./features/categorias/categoria-form.component').then((m) => m.CategoriaFormComponent)
      },

      // ---------- Proveedores: ADMINISTRACION/COMPRAS (CRUD), INVENTARIO (lectura) ----------
      {
        path: 'proveedores',
        canActivate: [roleGuard(['ADMINISTRACION', 'COMPRAS', 'INVENTARIO'])],
        loadComponent: () => import('./features/proveedores/proveedor-list.component').then((m) => m.ProveedorListComponent)
      },
      {
        path: 'proveedores/nuevo',
        canActivate: [roleGuard(['ADMINISTRACION', 'COMPRAS'])],
        loadComponent: () => import('./features/proveedores/proveedor-form.component').then((m) => m.ProveedorFormComponent)
      },
      {
        path: 'proveedores/:id/editar',
        canActivate: [roleGuard(['ADMINISTRACION', 'COMPRAS'])],
        loadComponent: () => import('./features/proveedores/proveedor-form.component').then((m) => m.ProveedorFormComponent)
      },

      // ---------- Compras: ADMINISTRACION/COMPRAS (CRUD), INVENTARIO (lectura) ----------
      {
        path: 'compras',
        canActivate: [roleGuard(['ADMINISTRACION', 'COMPRAS', 'INVENTARIO'])],
        loadComponent: () => import('./features/compras/compra-list.component').then((m) => m.CompraListComponent)
      },
      {
        path: 'compras/nueva',
        canActivate: [roleGuard(['ADMINISTRACION', 'COMPRAS'])],
        loadComponent: () => import('./features/compras/compra-form.component').then((m) => m.CompraFormComponent)
      },

      // ---------- Clientes: ADMINISTRACION/VENTAS ----------
      {
        path: 'clientes',
        canActivate: [roleGuard(['ADMINISTRACION', 'VENTAS'])],
        loadComponent: () => import('./features/clientes/cliente-list.component').then((m) => m.ClienteListComponent)
      },
      {
        path: 'clientes/nuevo',
        canActivate: [roleGuard(['ADMINISTRACION', 'VENTAS'])],
        loadComponent: () => import('./features/clientes/cliente-form.component').then((m) => m.ClienteFormComponent)
      },
      {
        path: 'clientes/:id/editar',
        canActivate: [roleGuard(['ADMINISTRACION', 'VENTAS'])],
        loadComponent: () => import('./features/clientes/cliente-form.component').then((m) => m.ClienteFormComponent)
      },

      // ---------- Ventas: ADMINISTRACION/VENTAS (CRUD), INVENTARIO (lectura) ----------
      {
        path: 'ventas',
        canActivate: [roleGuard(['ADMINISTRACION', 'VENTAS', 'INVENTARIO'])],
        loadComponent: () => import('./features/ventas/venta-list.component').then((m) => m.VentaListComponent)
      },
      {
        path: 'ventas/nueva',
        canActivate: [roleGuard(['ADMINISTRACION', 'VENTAS'])],
        loadComponent: () => import('./features/ventas/venta-form.component').then((m) => m.VentaFormComponent)
      },

      // ---------- Usuarios: solo ADMINISTRACION ----------
      {
        path: 'usuarios',
        canActivate: [roleGuard(['ADMINISTRACION'])],
        loadComponent: () => import('./features/usuarios/usuario-list.component').then((m) => m.UsuarioListComponent)
      },
      {
        path: 'usuarios/nuevo',
        canActivate: [roleGuard(['ADMINISTRACION'])],
        loadComponent: () => import('./features/usuarios/usuario-form.component').then((m) => m.UsuarioFormComponent)
      },
      {
        path: 'usuarios/:id/editar',
        canActivate: [roleGuard(['ADMINISTRACION'])],
        loadComponent: () => import('./features/usuarios/usuario-form.component').then((m) => m.UsuarioFormComponent)
      },

      // ---------- Inventario: historial visible para todos, ajustes solo INVENTARIO ----------
      {
        path: 'inventario/:productoId/historial',
        canActivate: [roleGuard(TODOS)],
        loadComponent: () => import('./features/inventario/historial.component').then((m) => m.HistorialComponent)
      },
      {
        path: 'inventario/ajustes',
        canActivate: [roleGuard(['INVENTARIO'])],
        loadComponent: () => import('./features/inventario/ajuste-form.component').then((m) => m.AjusteFormComponent)
      },

      // ---------- Reportes: cada sub-reporte con su propio rol permitido ----------
      {
        path: 'reportes/productos',
        canActivate: [roleGuard(['ADMINISTRACION', 'INVENTARIO'])],
        loadComponent: () =>
          import('./features/reportes/reportes-productos.component').then((m) => m.ReportesProductosComponent)
      },
      {
        path: 'reportes/compras',
        canActivate: [roleGuard(['ADMINISTRACION', 'COMPRAS'])],
        loadComponent: () =>
          import('./features/reportes/reportes-compras.component').then((m) => m.ReportesComprasComponent)
      },
      {
        path: 'reportes/ventas',
        canActivate: [roleGuard(['ADMINISTRACION', 'VENTAS'])],
        loadComponent: () =>
          import('./features/reportes/reportes-ventas.component').then((m) => m.ReportesVentasComponent)
      },
      {
        path: 'reportes/logs',
        canActivate: [roleGuard(['ADMINISTRACION'])],
        loadComponent: () => import('./features/reportes/reportes-logs.component').then((m) => m.ReportesLogsComponent)
      }
    ]
  },
  { path: '**', redirectTo: '' }
];
