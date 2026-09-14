package sofiao.minierp.service;

import sofiao.minierp.dto.inventario.AjusteInventarioRequest;
import sofiao.minierp.dto.inventario.MovimientoResponse;
import sofiao.minierp.entity.Log;
import sofiao.minierp.entity.MovimientoInventario;
import sofiao.minierp.entity.Producto;
import sofiao.minierp.entity.Usuario;
import sofiao.minierp.exception.ResourceNotFoundException;
import sofiao.minierp.repository.LogRepository;
import sofiao.minierp.repository.ProductoRepository;
import sofiao.minierp.repository.UsuarioRepository;
import sofiao.minierp.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static sofiao.minierp.entity.Accion.CREAR;
import static sofiao.minierp.entity.Modulo.INVENTARIO;

@Service
@RequiredArgsConstructor
public class InventarioAppService {

    private final InventarioService inventarioService;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LogRepository logRepository;

    @Transactional
    public MovimientoResponse registrarAjuste(AjusteInventarioRequest req) {
        Producto producto = productoRepository.findById(req.productoId())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + req.productoId()));
        Usuario usuario = usuarioActual();

        MovimientoInventario movimiento = inventarioService.registrarAjuste(
                producto, req.sentido(), req.cantidad(), req.motivo(), usuario);

        logRepository.save(Log.builder()
                .usuario(usuario)
                .modulo(INVENTARIO)
                .accion(CREAR)
                .descripcion("Ajuste manual (%s) de %d unidades en %s: %s"
                        .formatted(req.sentido(), req.cantidad(), producto.getNombre(), req.motivo()))
                .build());

        return MovimientoResponse.from(movimiento);
    }

    @Transactional(readOnly = true)
    public List<MovimientoResponse> historialDeProducto(Long productoId) {
        return inventarioService.historialDeProducto(productoId).stream()
                .map(MovimientoResponse::from)
                .toList();
    }

    private Usuario usuarioActual() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return usuarioRepository.findById(principal.getId()).orElseThrow();
    }
}
