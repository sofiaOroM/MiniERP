package sofiao.minierp.repository;

import sofiao.minierp.entity.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface CompraRepository extends JpaRepository<Compra, Long> {

    @Query("SELECT c FROM Compra c WHERE c.fecha BETWEEN :desde AND :hasta ORDER BY c.fecha")
    List<Compra> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);

    @Query("""
        SELECT c.proveedor.id, c.proveedor.nombre, SUM(c.total)
        FROM Compra c
        GROUP BY c.proveedor.id, c.proveedor.nombre
        ORDER BY SUM(c.total) DESC
        """)
    List<Object[]> findTop5ProveedoresPorMonto();
}
