package sofiao.minierp.dto.inventario;

import sofiao.minierp.entity.MovimientoInventario;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record AjusteInventarioRequest(
        @NotNull(message = "El producto es obligatorio") Long productoId,
        @NotNull(message = "El sentido es obligatorio (ENTRADA o SALIDA)")
        MovimientoInventario.TipoMovimiento sentido,
        @Min(value = 1, message = "La cantidad debe ser mayor a 0") int cantidad,
        @NotBlank(message = "El motivo del ajuste es obligatorio") String motivo
) {}
