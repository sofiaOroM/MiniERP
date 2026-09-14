package sofiao.minierp.controller;

import sofiao.minierp.dto.cliente.ClienteDTO;
import sofiao.minierp.entity.Cliente;
import sofiao.minierp.service.ClienteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Matriz de permisos (Clientes):
 *   ADMINISTRACION -> CRUD | VENTAS -> CRUD | COMPRAS/INVENTARIO -> sin acceso
 */
@RestController
@RequestMapping("/api/clientes")
@RequiredArgsConstructor
public class ClienteController {

    private final ClienteService clienteService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRACION','VENTAS')")
    public List<Cliente> listar() {
        return clienteService.listar();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','VENTAS')")
    public Cliente obtener(@PathVariable Long id) {
        return clienteService.obtener(id);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRACION','VENTAS')")
    @ResponseStatus(HttpStatus.CREATED)
    public Cliente crear(@Valid @RequestBody ClienteDTO dto) {
        return clienteService.crear(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','VENTAS')")
    public Cliente actualizar(@PathVariable Long id, @Valid @RequestBody ClienteDTO dto) {
        return clienteService.actualizar(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','VENTAS')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        clienteService.eliminar(id);
    }
}
