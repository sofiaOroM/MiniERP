package sofiao.minierp.entity;

/**
 * UEPS (LIFO) para producto_id impar, PEPS (FIFO) para producto_id par,
 * según la regla de negocio del enunciado. Ver Producto#getMetodoCosteo().
 */
public enum MetodoCosteo {
    UEPS,
    PEPS
}