package sofiao.minierp.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CambiarPasswordRequest(
        @NotBlank(message = "Debes indicar tu contraseña actual") String passwordActual,
        @NotBlank(message = "La nueva contraseña es obligatoria")
        @Size(min = 6, message = "La nueva contraseña debe tener al menos 6 caracteres")
        String passwordNuevo
) {}