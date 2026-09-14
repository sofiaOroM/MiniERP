package sofiao.minierp.service;

import sofiao.minierp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportesService {

    private final VentaDetalleRepository ventaDetalleRepository;
    private final ProductoService productoService;
    private final MovimientoInventarioRepository movimientoInventarioRepository;
    private final CompraRepository compraRepository;
    private final CompraDetalleRepository compraDetalleRepository;
    private final VentaRepository ventaRepository;
    private final LogRepository logRepository;

    // ---------- Productos / Inventario ----------
    public List<Object[]> top10ProductosMasVendidos() {
        return primeros(ventaDetalleRepository.findTop10ProductosMasVendidos(), 10);
    }

    public List<?> productosConMenorExistencia() {
        return productoService.conExistenciaBaja();
    }

    public List<Object[]> productosConMasMovimientos() {
        return movimientoInventarioRepository.findProductosConMasMovimientos();
    }

    // ---------- Compras / Proveedores ----------
    public List<Object[]> top5ProveedoresPorMonto() {
        return primeros(compraRepository.findTop5ProveedoresPorMonto(), 5);
    }

    public List<Object[]> productosAdquiridosConMasFrecuencia() {
        return compraDetalleRepository.findProductosAdquiridosConMasFrecuencia();
    }

    // ---------- Ventas / Clientes ----------
    public List<Object[]> top10ClientesPorMonto() {
        return primeros(ventaRepository.findTop10ClientesPorMonto(), 10);
    }

    public List<Object[]> top10ProductosPorIngresos() {
        return primeros(ventaDetalleRepository.findTop10ProductosPorIngresos(), 10);
    }

    public List<Object[]> resumenVentasPorPeriodo() {
        return ventaRepository.findResumenVentasPorPeriodo();
    }

    // ---------- Logs ----------
    public List<?> logsRecientes() {
        return logRepository.findTop200ByOrderByFechaDesc();
    }

    public List<?> logsPorModulo(String modulo) {
        return logRepository.findByModuloOrderByFechaDesc(modulo);
    }

    private <T> List<T> primeros(List<T> lista, int n) {
        return lista.size() > n ? lista.subList(0, n) : lista;
    }
}
