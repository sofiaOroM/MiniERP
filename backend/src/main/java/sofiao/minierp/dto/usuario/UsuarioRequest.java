package sofiao.minierp.dto.usuario;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UsuarioRequest(
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        @NotBlank(message = "El username es obligatorio") String username,
        @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres") String password, // null al actualizar = no cambiar
        @NotNull(message = "El rol es obligatorio") Integer rolId
) {}
