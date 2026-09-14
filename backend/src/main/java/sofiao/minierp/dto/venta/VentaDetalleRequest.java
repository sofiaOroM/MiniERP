package sofiao.minierp.dto.venta;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record VentaDetalleRequest(
        @NotNull(message = "El producto es obligatorio") Long productoId,
        @Min(value = 1, message = "La cantidad debe ser mayor a 0") int cantidad
) {}
