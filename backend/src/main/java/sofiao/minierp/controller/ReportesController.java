package sofiao.minierp.controller;

import sofiao.minierp.dto.producto.ProductoResponse;
import sofiao.minierp.dto.reportes.LogResponse;
import sofiao.minierp.entity.Modulo;
import sofiao.minierp.service.ReportesService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Matriz de permisos (Reportes):
 *   productos/inventario -> ADMINISTRACION, INVENTARIO
 *   compras/proveedores  -> ADMINISTRACION, COMPRAS
 *   ventas/clientes      -> ADMINISTRACION, VENTAS
 *   logs                 -> solo ADMINISTRACION
 */
@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
public class ReportesController {

    private final ReportesService reportesService;

    // ---------- Productos / Inventario ----------
    @GetMapping("/productos/top-vendidos")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','INVENTARIO')")
    public List<Object[]> top10ProductosMasVendidos() {
        return reportesService.top10ProductosMasVendidos();
    }

    @GetMapping("/productos/menor-existencia")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','INVENTARIO')")
    public List<ProductoResponse> productosConMenorExistencia() {
        return reportesService.productosConMenorExistencia();
    }

    @GetMapping("/productos/mas-movimientos")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','INVENTARIO')")
    public List<Object[]> productosConMasMovimientos() {
        return reportesService.productosConMasMovimientos();
    }

    // ---------- Compras / Proveedores ----------
    @GetMapping("/proveedores/top-monto")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS')")
    public List<Object[]> top5ProveedoresPorMonto() {
        return reportesService.top5ProveedoresPorMonto();
    }

    @GetMapping("/compras/productos-mas-frecuentes")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS')")
    public List<Object[]> productosAdquiridosConMasFrecuencia() {
        return reportesService.productosAdquiridosConMasFrecuencia();
    }

    // ---------- Ventas / Clientes ----------
    @GetMapping("/clientes/top-monto")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','VENTAS')")
    public List<Object[]> top10ClientesPorMonto() {
        return reportesService.top10ClientesPorMonto();
    }

    @GetMapping("/productos/top-ingresos")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','VENTAS')")
    public List<Object[]> top10ProductosPorIngresos() {
        return reportesService.top10ProductosPorIngresos();
    }

    @GetMapping("/ventas/resumen-periodo")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','VENTAS')")
    public List<Object[]> resumenVentasPorPeriodo() {
        return reportesService.resumenVentasPorPeriodo();
    }

    // ---------- Logs ----------
    @GetMapping("/logs")
    @PreAuthorize("hasRole('ADMINISTRACION')")
    public List<LogResponse> logs(@RequestParam(required = false) Modulo modulo) {
        return modulo != null ? reportesService.logsPorModulo(modulo) : reportesService.logsRecientes();
    }
}
