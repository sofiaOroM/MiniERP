package sofiao.minierp.repository;

import sofiao.minierp.entity.LoteInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LoteInventarioRepository extends JpaRepository<LoteInventario, Long> {

    /** PEPS (FIFO): el lote más antiguo primero. Usado cuando producto_id es par. */
    @Query("""
        SELECT l FROM LoteInventario l
        WHERE l.producto.id = :productoId AND l.cantidadDisponible > 0
        ORDER BY l.fechaIngreso ASC, l.id ASC
        """)
    List<LoteInventario> findDisponiblesPeps(Long productoId);

    /** UEPS (LIFO): el lote más reciente primero. Usado cuando producto_id es impar. */
    @Query("""
        SELECT l FROM LoteInventario l
        WHERE l.producto.id = :productoId AND l.cantidadDisponible > 0
        ORDER BY l.fechaIngreso DESC, l.id DESC
        """)
    List<LoteInventario> findDisponiblesUeps(Long productoId);

    @Query("""
        SELECT COALESCE(SUM(l.cantidadDisponible), 0)
        FROM LoteInventario l WHERE l.producto.id = :productoId
        """)
    Integer sumCantidadDisponible(Long productoId);

    @Query("""
        SELECT COALESCE(SUM(l.cantidadDisponible * l.costoUnitario), 0)
        FROM LoteInventario l WHERE l.producto.id = :productoId
        """)
    java.math.BigDecimal sumValorDisponible(Long productoId);

    List<LoteInventario> findByProductoIdOrderByFechaIngresoAsc(Long productoId);
}
