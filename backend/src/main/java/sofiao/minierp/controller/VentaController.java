package sofiao.minierp.controller;

import sofiao.minierp.dto.venta.VentaRequest;
import sofiao.minierp.dto.venta.VentaResponse;
import sofiao.minierp.service.VentaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Matriz de permisos (Ventas):
 *   ADMINISTRACION -> CRUD | VENTAS -> CRUD | INVENTARIO -> Lectura | COMPRAS -> sin acceso
 */
@RestController
@RequestMapping("/api/ventas")
@RequiredArgsConstructor
public class VentaController {

    private final VentaService ventaService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRACION','VENTAS')")
    @ResponseStatus(HttpStatus.CREATED)
    public VentaResponse registrar(@Valid @RequestBody VentaRequest request) {
        return VentaResponse.from(ventaService.registrar(request));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRACION','VENTAS','INVENTARIO')")
    public List<VentaResponse> buscarPorFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime desde,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime hasta) {
        return ventaService.buscarPorRangoFechas(desde, hasta).stream().map(VentaResponse::from).toList();
    }

    @GetMapping("/{id}/factura")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','VENTAS')")
    public ResponseEntity<FileSystemResource> descargarFactura(@PathVariable Long id) {
        File archivo = ventaService.obtenerArchivoFactura(id);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + archivo.getName() + "\"")
                .body(new FileSystemResource(archivo));
    }
}
