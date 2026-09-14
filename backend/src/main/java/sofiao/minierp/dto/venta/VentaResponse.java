package sofiao.minierp.dto.venta;

import sofiao.minierp.entity.Venta;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record VentaResponse(
        Long id,
        String clienteNombre,
        String numeroFactura,
        LocalDateTime fecha,
        BigDecimal subtotal,
        BigDecimal iva,
        BigDecimal total,
        String pdfPath,
        List<LineaResponse> detalles
) {
    public record LineaResponse(String producto, int cantidad, BigDecimal precioUnitario, BigDecimal subtotal) {}

    public static VentaResponse from(Venta v) {
        return new VentaResponse(
                v.getId(),
                v.getCliente().getNombre(),
                v.getNumeroFactura(),
                v.getFecha(),
                v.getSubtotal(),
                v.getIva(),
                v.getTotal(),
                v.getPdfPath(),
                v.getDetalles().stream()
                        .map(d -> new LineaResponse(d.getProducto().getNombre(), d.getCantidad(), d.getPrecioUnitario(), d.getSubtotal()))
                        .toList()
        );
    }
}
