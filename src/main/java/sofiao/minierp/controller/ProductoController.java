package sofiao.minierp.controller;

import sofiao.minierp.dto.producto.ProductoRequest;
import sofiao.minierp.dto.producto.ProductoResponse;
import sofiao.minierp.service.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Matriz de permisos (Productos/Categorías):
 *   ADMINISTRACION -> CRUD | COMPRAS/INVENTARIO/VENTAS -> Lectura
 */
@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS','INVENTARIO','VENTAS')")
    public List<ProductoResponse> listar() {
        return productoService.listar();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS','INVENTARIO','VENTAS')")
    public ProductoResponse obtener(@PathVariable Long id) {
        return productoService.obtener(id);
    }

    @GetMapping("/existencia-baja")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','INVENTARIO')")
    public List<ProductoResponse> conExistenciaBaja() {
        return productoService.conExistenciaBaja();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRACION')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoResponse crear(@Valid @RequestBody ProductoRequest req) {
        return productoService.crear(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRACION')")
    public ProductoResponse actualizar(@PathVariable Long id, @Valid @RequestBody ProductoRequest req) {
        return productoService.actualizar(id, req);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRACION')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        productoService.eliminar(id);
    }
}
