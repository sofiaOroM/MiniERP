package sofiao.minierp.controller;

import sofiao.minierp.dto.auth.CambiarPasswordRequest;
import sofiao.minierp.dto.auth.LoginRequest;
import sofiao.minierp.dto.auth.LoginResponse;
import sofiao.minierp.security.UserPrincipal;
import sofiao.minierp.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * Self-service: cualquier usuario autenticado (sin importar su rol)
     * puede cambiar SU PROPIA contraseña. No lleva @PreAuthorize por rol
     * a propósito, solo requiere estar autenticado (regla por defecto de
     * SecurityConfig). El id sale del propio token, nunca de un parámetro
     * que mande el cliente.
     */
    @PutMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cambiarPassword(@AuthenticationPrincipal UserPrincipal principal,
                                @Valid @RequestBody CambiarPasswordRequest request) {
        authService.cambiarPassword(principal.getId(), request);
    }
}