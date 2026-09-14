package sofiao.minierp.controller;

import sofiao.minierp.dto.compra.CompraRequest;
import sofiao.minierp.dto.compra.CompraResponse;
import sofiao.minierp.service.CompraService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Matriz de permisos (Compras):
 *   ADMINISTRACION -> CRUD | COMPRAS -> CRUD | INVENTARIO -> Lectura | VENTAS -> sin acceso
 */
@RestController
@RequestMapping("/api/compras")
@RequiredArgsConstructor
public class CompraController {

    private final CompraService compraService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS')")
    @ResponseStatus(HttpStatus.CREATED)
    public CompraResponse registrar(@Valid @RequestBody CompraRequest request) {
        return CompraResponse.from(compraService.registrar(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS','INVENTARIO')")
    public List<CompraResponse> buscarPorFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return compraService.buscarPorRangoFechas(desde, hasta).stream().map(CompraResponse::from).toList();
    }
}
