package sofiao.minierp.service;

import sofiao.minierp.dto.auth.CambiarPasswordRequest;
import sofiao.minierp.dto.auth.LoginRequest;
import sofiao.minierp.dto.auth.LoginResponse;
import sofiao.minierp.entity.Log;
import sofiao.minierp.entity.Modulo;
import sofiao.minierp.entity.Accion;
import sofiao.minierp.entity.Usuario;
import sofiao.minierp.repository.LogRepository;
import sofiao.minierp.repository.UsuarioRepository;
import sofiao.minierp.security.JwtUtil;
import sofiao.minierp.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final LogRepository logRepository;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        try {
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.username(), request.password()));

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            String token = jwtUtil.generarToken(principal);

            registrarLoginExitoso(principal.getId());

            return new LoginResponse(token, principal.getUsername(), principal.getNombreCompleto(), principal.getRolNombre());
        } catch (org.springframework.security.core.AuthenticationException ex) {
            throw new BadCredentialsException("Usuario o contraseña incorrectos");
        }
    }

    /**
     * Cambio de contraseña self-service: cualquier usuario autenticado puede
     * cambiar SU PROPIA contraseña (a diferencia de PUT /api/usuarios/{id},
     * que es exclusivo de ADMINISTRACION y sirve para gestionar a otros).
     * Exige la contraseña actual para evitar que, si alguien deja su sesión
     * abierta, un tercero pueda tomar la cuenta con solo el token.
     */
    @Transactional
    public void cambiarPassword(Long usuarioId, CambiarPasswordRequest request) {
        Usuario usuario = usuarioRepository.findById(usuarioId).orElseThrow();

        if (!passwordEncoder.matches(request.passwordActual(), usuario.getPasswordHash())) {
            throw new BadCredentialsException("La contraseña actual no es correcta");
        }

        usuario.setPasswordHash(passwordEncoder.encode(request.passwordNuevo()));

        logRepository.save(Log.builder()
                .usuario(usuario)
                .modulo(Modulo.USUARIOS)
                .accion(Accion.ACTUALIZAR)
                .descripcion("El usuario cambió su propia contraseña")
                .build());
    }

    private void registrarLoginExitoso(Long usuarioId) {
        var usuario = usuarioRepository.findById(usuarioId).orElseThrow();
        logRepository.save(Log.builder()
                .usuario(usuario)
                .modulo(Modulo.USUARIOS)
                .accion(Accion.LOGIN)
                .descripcion("Inicio de sesión exitoso")
                .build());
    }
}