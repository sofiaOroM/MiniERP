package sofiao.minierp.dto.usuario;

import sofiao.minierp.entity.Usuario;

public record UsuarioResponse(Long id, String nombre, String username, String rol, Boolean activo) {
    public static UsuarioResponse from(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getUsername(), u.getRol().getNombre(), u.getActivo());
    }
}
