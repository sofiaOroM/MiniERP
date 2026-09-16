package sofiao.minierp.controller;

import sofiao.minierp.dto.producto.CategoriaDTO;
import sofiao.minierp.entity.Categoria;
import sofiao.minierp.service.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS','INVENTARIO','VENTAS')")
    public List<Categoria> listar() {
        return categoriaService.listar();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRACION','COMPRAS','INVENTARIO','VENTAS')")
    public Categoria obtener(@PathVariable Integer id) {
        return categoriaService.obtener(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRACION')")
    @ResponseStatus(HttpStatus.CREATED)
    public Categoria crear(@Valid @RequestBody CategoriaDTO dto) {
        return categoriaService.crear(dto);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRACION')")
    public Categoria actualizar(@PathVariable Integer id, @Valid @RequestBody CategoriaDTO dto) {
        return categoriaService.actualizar(id, dto);
    }
}
