package sofiao.minierp.dto.producto;

import jakarta.validation.constraints.NotBlank;

public record CategoriaDTO(
        Integer id,
        @NotBlank(message = "El nombre es obligatorio") String nombre,
        String descripcion
) {}
