package sofiao.minierp.dto.compra;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CompraDetalleRequest(
        @NotNull(message = "El producto es obligatorio") Long productoId,
        @Min(value = 1, message = "La cantidad debe ser mayor a 0") int cantidad,
        @DecimalMin(value = "0.0", inclusive = false, message = "El precio unitario debe ser mayor a 0") BigDecimal precioUnitario
) {}
