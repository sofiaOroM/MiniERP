package sofiao.minierp.service;

import sofiao.minierp.dto.producto.CategoriaDTO;
import sofiao.minierp.entity.Categoria;
import sofiao.minierp.exception.ResourceNotFoundException;
import sofiao.minierp.repository.CategoriaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<Categoria> listar() {
        return categoriaRepository.findAll();
    }

    @Transactional
    public Categoria crear(CategoriaDTO dto) {
        return categoriaRepository.save(Categoria.builder().nombre(dto.nombre()).descripcion(dto.descripcion()).build());
    }

    @Transactional
    public Categoria actualizar(Integer id, CategoriaDTO dto) {
        Categoria categoria = categoriaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + id));
        categoria.setNombre(dto.nombre());
        categoria.setDescripcion(dto.descripcion());
        return categoria;
    }
}
