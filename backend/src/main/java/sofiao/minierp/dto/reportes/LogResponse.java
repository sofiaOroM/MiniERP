package sofiao.minierp.dto.reportes;

import sofiao.minierp.entity.Log;

import java.time.LocalDateTime;

public record LogResponse(
        Long id,
        UsuarioResumen usuario,
        String modulo,
        String accion,
        String descripcion,
        LocalDateTime fecha
) {
    public record UsuarioResumen(Long id, String nombre, String username) {}

    public static LogResponse from(Log log) {
        var u = log.getUsuario();
        return new LogResponse(
                log.getId(),
                new UsuarioResumen(u.getId(), u.getNombre(), u.getUsername()),
                log.getModulo().name(), log.getAccion().name(), log.getDescripcion(), log.getFecha()
        );
    }
}