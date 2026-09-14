package sofiao.minierp.repository;

import sofiao.minierp.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    Optional<Producto> findByCodigo(String codigo);

    List<Producto> findByActivoTrue();

    @Query("""
        SELECT p FROM Producto p
        JOIN Inventario i ON i.producto = p
        WHERE i.existenciaActual <= p.stockMinimo AND p.activo = true
        ORDER BY i.existenciaActual ASC
        """)
    List<Producto> findConExistenciaBaja();
}