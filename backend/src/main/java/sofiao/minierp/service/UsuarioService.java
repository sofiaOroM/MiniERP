package sofiao.minierp.service;

import sofiao.minierp.dto.usuario.UsuarioRequest;
import sofiao.minierp.dto.usuario.UsuarioResponse;
import sofiao.minierp.entity.Accion;
import sofiao.minierp.entity.Log;
import sofiao.minierp.entity.Rol;
import sofiao.minierp.entity.Usuario;
import sofiao.minierp.exception.BusinessRuleException;
import sofiao.minierp.exception.ResourceNotFoundException;
import sofiao.minierp.repository.LogRepository;
import sofiao.minierp.repository.RolRepository;
import sofiao.minierp.repository.UsuarioRepository;
import sofiao.minierp.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static sofiao.minierp.entity.Accion.*;
import static sofiao.minierp.entity.Modulo.USUARIOS;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final LogRepository logRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll().stream().map(UsuarioResponse::from).toList();
    }

    @Transactional
    public UsuarioResponse crear(UsuarioRequest req) {
        if (req.password() == null || req.password().isBlank()) {
            throw new BusinessRuleException("La contraseña es obligatoria al crear un usuario");
        }
        Rol rol = rolRepository.findById(req.rolId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + req.rolId()));

        Usuario usuario = Usuario.builder()
                .nombre(req.nombre())
                .username(req.username())
                .passwordHash(passwordEncoder.encode(req.password()))
                .rol(rol)
                .activo(true)
                .build();
        usuario = usuarioRepository.save(usuario);
        registrarLog(CREAR, "Usuario creado: " + usuario.getUsername() + " (" + rol.getNombre() + ")");
        return UsuarioResponse.from(usuario);
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioRequest req) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
        Rol rol = rolRepository.findById(req.rolId())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado: " + req.rolId()));

        usuario.setNombre(req.nombre());
        usuario.setUsername(req.username());
        usuario.setRol(rol);
        if (req.password() != null && !req.password().isBlank()) {
            usuario.setPasswordHash(passwordEncoder.encode(req.password()));
        }
        registrarLog(ACTUALIZAR, "Usuario actualizado: " + usuario.getUsername());
        return UsuarioResponse.from(usuario);
    }

    @Transactional
    public void desactivar(Long id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + id));
        usuario.setActivo(false); // baja lógica: conserva autoría de compras/ventas/logs históricos
        registrarLog(ELIMINAR, "Usuario desactivado: " + usuario.getUsername());
    }

    private void registrarLog(Accion accion, String descripcion) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        var actor = usuarioRepository.findById(principal.getId()).orElseThrow();
        logRepository.save(Log.builder()
                .usuario(actor).modulo(USUARIOS).accion(accion).descripcion(descripcion).build());
    }
}
