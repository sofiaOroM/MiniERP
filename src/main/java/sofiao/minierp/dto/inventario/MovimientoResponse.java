package sofiao.minierp.dto.inventario;

import sofiao.minierp.entity.MovimientoInventario;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record MovimientoResponse(
        Long id,
        String producto,
        String tipoMovimiento,
        Integer cantidad,
        BigDecimal costoUnitario,
        Integer saldoCantidad,
        BigDecimal saldoValor,
        String origen,          // "Compra FC-1001", "Venta FAC-2003" o "Ajuste manual"
        String motivoAjuste,
        LocalDateTime fecha,
        String usuario,
        List<DesgloseLote> lotes
) {
    public record DesgloseLote(Long loteId, Integer cantidad, BigDecimal costoUnitario) {}

    public static MovimientoResponse from(MovimientoInventario m) {
        String origen;
        if (m.getCompra() != null) origen = "Compra " + m.getCompra().getNumeroDocumento();
        else if (m.getVenta() != null) origen = "Venta " + m.getVenta().getNumeroFactura();
        else origen = "Ajuste manual";

        return new MovimientoResponse(
                m.getId(), m.getProducto().getNombre(), m.getTipoMovimiento().name(),
                m.getCantidad(), m.getCostoUnitario(), m.getSaldoCantidad(), m.getSaldoValor(),
                origen, m.getMotivoAjuste(), m.getFecha(), m.getUsuario().getNombre(),
                m.getDesglose().stream()
                        .map(d -> new DesgloseLote(d.getLote().getId(), d.getCantidad(), d.getCostoUnitario()))
                        .toList()
        );
    }
}
