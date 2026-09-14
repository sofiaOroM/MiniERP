package sofiao.minierp.dto.proveedor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ProveedorDTO(
        Long id,
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        @NotBlank(message = "El NIT es obligatorio") String nit,
        String telefono,
        String direccion,
        @Email(message = "Email inválido") String email,
        Boolean activo
) {}
