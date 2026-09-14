package sofiao.minierp.dto.cliente;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClienteDTO(
        Long id,
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        @NotBlank(message = "El NIT es obligatorio (use 'CF' para consumidor final)") String nit,
        String telefono,
        String direccion,
        @Email(message = "Email inválido") String email,
        Boolean activo
) {}
