package sofiao.minierp.dto.compra;

import sofiao.minierp.entity.Compra;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CompraResponse(
        Long id,
        String proveedorNombre,
        String numeroDocumento,
        LocalDateTime fecha,
        BigDecimal subtotal,
        BigDecimal iva,
        BigDecimal total,
        List<LineaResponse> detalles
) {
    public record LineaResponse(String producto, int cantidad, BigDecimal precioUnitario, BigDecimal subtotal) {}

    public static CompraResponse from(Compra c) {
        return new CompraResponse(
                c.getId(),
                c.getProveedor().getNombre(),
                c.getNumeroDocumento(),
                c.getFecha(),
                c.getSubtotal(),
                c.getIva(),
                c.getTotal(),
                c.getDetalles().stream()
                        .map(d -> new LineaResponse(d.getProducto().getNombre(), d.getCantidad(), d.getPrecioUnitario(), d.getSubtotal()))
                        .toList()
        );
    }
}
