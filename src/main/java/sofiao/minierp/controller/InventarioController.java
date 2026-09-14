package sofiao.minierp.controller;

import sofiao.minierp.dto.inventario.AjusteInventarioRequest;
import sofiao.minierp.dto.inventario.MovimientoResponse;
import sofiao.minierp.service.InventarioAppService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Matriz de permisos (Inventario/Movimientos/Lotes):
 *   ADMINISTRACION -> Lectura | COMPRAS -> Lectura | INVENTARIO -> CRUD (crear ajustes,
 *   nunca editar/eliminar movimientos ya existentes: el kardex es append-only) | VENTAS -> Lectura
 */
@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioAppService inventarioAppService;

    @GetMapping("/movimientos/{productoId}")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS','INVENTARIO','VENTAS')")
    public List<MovimientoResponse> historial(@PathVariable Long productoId) {
        return inventarioAppService.historialDeProducto(productoId);
    }

    @PostMapping("/ajustes")
    @PreAuthorize("hasRole('INVENTARIO')")
    @ResponseStatus(HttpStatus.CREATED)
    public MovimientoResponse registrarAjuste(@Valid @RequestBody AjusteInventarioRequest req) {
        return inventarioAppService.registrarAjuste(req);
    }
}
