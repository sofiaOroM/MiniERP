package sofiao.minierp.dto.producto;

import sofiao.minierp.entity.Producto;

import java.math.BigDecimal;

public record ProductoResponse(
        Long id,
        String codigo,
        String nombre,
        String descripcion,
        String categoria,
        String unidadMedida,
        BigDecimal precioVenta,
        BigDecimal costoReferencia,
        Integer stockMinimo,
        Integer existenciaActual,
        String metodoCosteo, // UEPS o PEPS, calculado a partir de la paridad del id
        Boolean activo
) {
    public static ProductoResponse from(Producto p, Integer existenciaActual) {
        return new ProductoResponse(
                p.getId(), p.getCodigo(), p.getNombre(), p.getDescripcion(),
                p.getCategoria().getNombre(), p.getUnidadMedida(),
                p.getPrecioVenta(), p.getCostoReferencia(), p.getStockMinimo(),
                existenciaActual, p.getMetodoCosteo().name(), p.getActivo()
        );
    }
}
