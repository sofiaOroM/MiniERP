package sofiao.minierp.service;

import sofiao.minierp.dto.auth.LoginRequest;
import sofiao.minierp.dto.auth.LoginResponse;
import sofiao.minierp.entity.Log;
import sofiao.minierp.repository.LogRepository;
import sofiao.minierp.repository.UsuarioRepository;
import sofiao.minierp.security.JwtUtil;
import sofiao.minierp.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import static sofiao.minierp.entity.Accion.*;
import static sofiao.minierp.entity.Modulo.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final UsuarioRepository usuarioRepository;
    private final LogRepository logRepository;

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

    private void registrarLoginExitoso(Long usuarioId) {
        var usuario = usuarioRepository.findById(usuarioId).orElseThrow();
        logRepository.save(Log.builder()
                .usuario(usuario)
                .modulo(USUARIOS)
                .accion(LOGIN)
                .descripcion("Inicio de sesión exitoso")
                .build());
    }
}
