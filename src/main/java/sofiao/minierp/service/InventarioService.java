package sofiao.minierp.service;

import sofiao.minierp.entity.*;
import sofiao.minierp.exception.StockInsuficienteException;
import sofiao.minierp.repository.InventarioRepository;
import sofiao.minierp.repository.LoteInventarioRepository;
import sofiao.minierp.repository.MovimientoInventarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Responsable único de mover existencias. Ni CompraService ni VentaService
 * tocan lotes/inventario directamente: siempre pasan por aquí, así toda la
 * regla de costeo y todas las validaciones de integridad viven en un solo
 * lugar (evita que dos servicios diverjan en cómo interpretan UEPS/PEPS).
 */
@Service
@RequiredArgsConstructor
public class InventarioService {

    private final InventarioRepository inventarioRepository;
    private final LoteInventarioRepository loteInventarioRepository;
    private final MovimientoInventarioRepository movimientoInventarioRepository;

    /**
     * Registra la entrada de una compra: crea el lote y el movimiento de kardex.
     * Se llama una vez por cada línea de compra_detalle.
     */
    @Transactional
    public MovimientoInventario registrarEntradaPorCompra(CompraDetalle detalle, Usuario usuario) {
        Producto producto = detalle.getProducto();

        // Asegura que exista la fila de inventario (por si el producto se creó
        // sin pasar por la carga inicial de Flyway).
        Inventario inventario = inventarioRepository.findByProductoId(producto.getId())
                .orElseGet(() -> inventarioRepository.save(
                        Inventario.builder().producto(producto).existenciaActual(0).build()));

        LoteInventario lote = LoteInventario.builder()
                .producto(producto)
                .compraDetalle(detalle)
                .cantidadInicial(detalle.getCantidad())
                .cantidadDisponible(detalle.getCantidad())
                .costoUnitario(detalle.getPrecioUnitario())
                .build();
        lote = loteInventarioRepository.save(lote); // dispara trg_sync_inventario (INSERT)

        Integer saldoCantidad = loteInventarioRepository.sumCantidadDisponible(producto.getId());
        BigDecimal saldoValor = loteInventarioRepository.sumValorDisponible(producto.getId());

        MovimientoInventario movimiento = MovimientoInventario.builder()
                .producto(producto)
                .tipoMovimiento(MovimientoInventario.TipoMovimiento.ENTRADA)
                .cantidad(detalle.getCantidad())
                .costoUnitario(detalle.getPrecioUnitario())
                .saldoCantidad(saldoCantidad)
                .saldoValor(saldoValor)
                .compra(detalle.getCompra())
                .usuario(usuario)
                .build();
        movimiento.addDesglose(MovimientoLote.builder()
                .lote(lote)
                .cantidad(detalle.getCantidad())
                .costoUnitario(detalle.getPrecioUnitario())
                .build());

        return movimientoInventarioRepository.save(movimiento);
    }

    /**
     * Registra la salida de una venta aplicando UEPS o PEPS según la paridad
     * del producto_id (regla fija del enunciado), repartiendo el consumo entre
     * tantos lotes como haga falta y dejando el desglose exacto en
     * movimiento_lote.
     */
    @Transactional
    public MovimientoInventario registrarSalidaPorVenta(VentaDetalle detalle, Usuario usuario) {
        Producto producto = detalle.getProducto();
        int cantidadSolicitada = detalle.getCantidad();

        // Bloqueo pesimista: evita que dos ventas concurrentes sobrevendan el mismo producto.
        Inventario inventario = inventarioRepository.findByProductoIdForUpdate(producto.getId())
                .orElseThrow(() -> new StockInsuficienteException(producto.getNombre(), cantidadSolicitada, 0));

        if (inventario.getExistenciaActual() < cantidadSolicitada) {
            throw new StockInsuficienteException(producto.getNombre(), cantidadSolicitada, inventario.getExistenciaActual());
        }

        ConsumoLotes consumo = consumirLotes(producto, cantidadSolicitada);

        MovimientoInventario movimiento = MovimientoInventario.builder()
                .producto(producto)
                .tipoMovimiento(MovimientoInventario.TipoMovimiento.SALIDA)
                .cantidad(cantidadSolicitada)
                .costoUnitario(consumo.costoPromedio())
                .venta(detalle.getVenta())
                .usuario(usuario)
                .saldoCantidad(loteInventarioRepository.sumCantidadDisponible(producto.getId()))
                .saldoValor(loteInventarioRepository.sumValorDisponible(producto.getId()))
                .build();
        consumo.desgloses().forEach(movimiento::addDesglose);

        return movimientoInventarioRepository.save(movimiento);
    }

    @Transactional(readOnly = true)
    public List<MovimientoInventario> historialDeProducto(Long productoId) {
        return movimientoInventarioRepository.findByProductoIdOrderByFechaDesc(productoId);
    }

    /**
     * Chequeo rápido de disponibilidad SIN bloqueo de fila, pensado para
     * validar de una vez todas las líneas de una venta antes de procesar
     * ninguna (mejor experiencia: un solo mensaje de error, no uno por línea).
     * La validación definitiva y segura ante concurrencia sigue ocurriendo
     * dentro de registrarSalidaPorVenta con PESSIMISTIC_WRITE.
     */
    @Transactional(readOnly = true)
    public void validarDisponibilidad(Producto producto, int cantidadSolicitada) {
        Inventario inventario = inventarioRepository.findByProductoId(producto.getId())
                .orElseThrow(() -> new StockInsuficienteException(producto.getNombre(), cantidadSolicitada, 0));
        if (inventario.getExistenciaActual() < cantidadSolicitada) {
            throw new StockInsuficienteException(producto.getNombre(), cantidadSolicitada, inventario.getExistenciaActual());
        }
    }

    /**
     * Ajuste manual de inventario (rol INVENTARIO): sube o baja existencias
     * sin que exista una compra o venta de por medio (ej. conteo físico,
     * merma, producto dañado). No tiene compra_id ni venta_id; el motivo
     * queda registrado en motivo_ajuste para auditoría.
     */
    @Transactional
    public MovimientoInventario registrarAjuste(Producto producto, MovimientoInventario.TipoMovimiento sentido,
                                                int cantidad, String motivo, Usuario usuario) {
        if (sentido == MovimientoInventario.TipoMovimiento.ENTRADA) {
            return registrarAjusteEntrada(producto, cantidad, motivo, usuario);
        }
        return registrarAjusteSalida(producto, cantidad, motivo, usuario);
    }

    private MovimientoInventario registrarAjusteEntrada(Producto producto, int cantidad, String motivo, Usuario usuario) {
        // Un ajuste de entrada crea su propio lote (sin compra_detalle_id),
        // valorizado al costo de referencia del producto.
        LoteInventario lote = loteInventarioRepository.save(LoteInventario.builder()
                .producto(producto)
                .cantidadInicial(cantidad)
                .cantidadDisponible(cantidad)
                .costoUnitario(producto.getCostoReferencia())
                .build());

        MovimientoInventario movimiento = MovimientoInventario.builder()
                .producto(producto)
                .tipoMovimiento(MovimientoInventario.TipoMovimiento.ENTRADA)
                .cantidad(cantidad)
                .costoUnitario(producto.getCostoReferencia())
                .motivoAjuste(motivo)
                .usuario(usuario)
                .saldoCantidad(loteInventarioRepository.sumCantidadDisponible(producto.getId()))
                .saldoValor(loteInventarioRepository.sumValorDisponible(producto.getId()))
                .build();
        movimiento.addDesglose(MovimientoLote.builder()
                .lote(lote).cantidad(cantidad).costoUnitario(producto.getCostoReferencia()).build());

        return movimientoInventarioRepository.save(movimiento);
    }

    private MovimientoInventario registrarAjusteSalida(Producto producto, int cantidad, String motivo, Usuario usuario) {
        Inventario inventario = inventarioRepository.findByProductoIdForUpdate(producto.getId())
                .orElseThrow(() -> new StockInsuficienteException(producto.getNombre(), cantidad, 0));
        if (inventario.getExistenciaActual() < cantidad) {
            throw new StockInsuficienteException(producto.getNombre(), cantidad, inventario.getExistenciaActual());
        }

        ConsumoLotes consumo = consumirLotes(producto, cantidad);

        MovimientoInventario movimiento = MovimientoInventario.builder()
                .producto(producto)
                .tipoMovimiento(MovimientoInventario.TipoMovimiento.SALIDA)
                .cantidad(cantidad)
                .costoUnitario(consumo.costoPromedio())
                .motivoAjuste(motivo)
                .usuario(usuario)
                .saldoCantidad(loteInventarioRepository.sumCantidadDisponible(producto.getId()))
                .saldoValor(loteInventarioRepository.sumValorDisponible(producto.getId()))
                .build();
        consumo.desgloses().forEach(movimiento::addDesglose);

        return movimientoInventarioRepository.save(movimiento);
    }

    /**
     * Aplica UEPS/PEPS (según paridad de producto_id) para repartir el
     * consumo de "cantidad" unidades entre los lotes disponibles. Usado
     * tanto por ventas como por ajustes de salida, para que ambos caminos
     * apliquen exactamente la misma regla de costeo.
     */
    private ConsumoLotes consumirLotes(Producto producto, int cantidad) {
        MetodoCosteo metodo = producto.getMetodoCosteo();
        List<LoteInventario> lotesDisponibles = (metodo == MetodoCosteo.PEPS)
                ? loteInventarioRepository.findDisponiblesPeps(producto.getId())
                : loteInventarioRepository.findDisponiblesUeps(producto.getId());

        int restante = cantidad;
        BigDecimal costoTotal = BigDecimal.ZERO;
        List<MovimientoLote> desgloses = new java.util.ArrayList<>();

        for (LoteInventario lote : lotesDisponibles) {
            if (restante <= 0) break;

            int tomar = Math.min(lote.getCantidadDisponible(), restante);
            lote.setCantidadDisponible(lote.getCantidadDisponible() - tomar);
            loteInventarioRepository.save(lote); // dispara trg_sync_inventario (UPDATE)

            costoTotal = costoTotal.add(lote.getCostoUnitario().multiply(BigDecimal.valueOf(tomar)));
            desgloses.add(MovimientoLote.builder().lote(lote).cantidad(tomar).costoUnitario(lote.getCostoUnitario()).build());

            restante -= tomar;
        }

        if (restante > 0) {
            // Defensa adicional: si por inconsistencia entre inventario.existencia_actual
            // y la suma real de lotes no alcanzó, no se deja completar la operación.
            throw new StockInsuficienteException(producto.getNombre(), cantidad, cantidad - restante);
        }

        BigDecimal costoPromedio = costoTotal.divide(BigDecimal.valueOf(cantidad), 2, java.math.RoundingMode.HALF_UP);
        return new ConsumoLotes(desgloses, costoPromedio);
    }

    private record ConsumoLotes(List<MovimientoLote> desgloses, BigDecimal costoPromedio) {}
}
