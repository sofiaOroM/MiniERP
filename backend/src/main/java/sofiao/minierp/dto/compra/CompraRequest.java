package sofiao.minierp.dto.compra;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CompraRequest(
        @NotNull(message = "El proveedor es obligatorio") Long proveedorId,
        @NotBlank(message = "El número de documento es obligatorio") String numeroDocumento,
        @NotEmpty(message = "La compra debe tener al menos un producto") @Valid List<CompraDetalleRequest> detalles
) {}
