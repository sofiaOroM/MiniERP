package sofiao.minierp.controller;

import sofiao.minierp.dto.proveedor.ProveedorDTO;
import sofiao.minierp.entity.Proveedor;
import sofiao.minierp.service.ProveedorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Matriz de permisos (Proveedores):
 *   ADMINISTRACION -> CRUD | COMPRAS -> CRUD | INVENTARIO -> Lectura | VENTAS -> sin acceso
 */
@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
public class ProveedorController {

    private final ProveedorService proveedorService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS','INVENTARIO')")
    public List<Proveedor> listar() {
        return proveedorService.listar();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS','INVENTARIO')")
    public Proveedor obtener(@PathVariable Long id) {
        return proveedorService.obtener(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS')")
    @ResponseStatus(HttpStatus.CREATED)
    public Proveedor crear(@Valid @RequestBody ProveedorDTO dto) {
        return proveedorService.crear(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS')")
    public Proveedor actualizar(@PathVariable Long id, @Valid @RequestBody ProveedorDTO dto) {
        return proveedorService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        proveedorService.eliminar(id);
    }
}
