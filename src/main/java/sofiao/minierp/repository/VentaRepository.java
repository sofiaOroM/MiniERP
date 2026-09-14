package sofiao.minierp.repository;

import sofiao.minierp.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface VentaRepository extends JpaRepository<Venta, Long> {

    Optional<Venta> findByNumeroFactura(String numeroFactura);

    @Query("SELECT v FROM Venta v WHERE v.fecha BETWEEN :desde AND :hasta ORDER BY v.fecha")
    List<Venta> findByFechaBetween(LocalDateTime desde, LocalDateTime hasta);

    @Query("""
        SELECT v.cliente.id, v.cliente.nombre, SUM(v.total)
        FROM Venta v
        GROUP BY v.cliente.id, v.cliente.nombre
        ORDER BY SUM(v.total) DESC
        """)
    List<Object[]> findTop10ClientesPorMonto();

    @Query(value = """
        SELECT to_char(fecha, 'YYYY-MM') AS periodo, COUNT(*) AS cantidad_ventas, SUM(total) AS monto_total
        FROM ventas
        GROUP BY periodo
        ORDER BY periodo
        """, nativeQuery = true)
    List<Object[]> findResumenVentasPorPeriodo();
}
