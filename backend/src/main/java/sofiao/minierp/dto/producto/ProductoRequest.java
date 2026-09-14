package sofiao.minierp.dto.producto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ProductoRequest(
        @NotBlank(message = "El código es obligatorio") String codigo,
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        String descripcion,
        @NotNull(message = "La categoría es obligatoria") Integer categoriaId,
        String unidadMedida,
        @DecimalMin(value = "0.0", inclusive = false, message = "El precio de venta debe ser mayor a 0") BigDecimal precioVenta,
        @DecimalMin(value = "0.0", message = "El costo de referencia no puede ser negativo") BigDecimal costoReferencia,
        Integer stockMinimo
) {}
