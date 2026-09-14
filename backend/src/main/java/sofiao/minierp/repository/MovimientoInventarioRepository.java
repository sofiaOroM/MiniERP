package sofiao.minierp.repository;

import sofiao.minierp.entity.MovimientoInventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MovimientoInventarioRepository extends JpaRepository<MovimientoInventario, Long> {

    List<MovimientoInventario> findByProductoIdOrderByFechaDesc(Long productoId);

    @Query("""
        SELECT m.producto.id, m.producto.nombre, COUNT(m)
        FROM MovimientoInventario m
        GROUP BY m.producto.id, m.producto.nombre
        ORDER BY COUNT(m) DESC
        """)
    List<Object[]> findProductosConMasMovimientos();
}
