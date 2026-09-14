package sofiao.minierp.repository;

import sofiao.minierp.entity.VentaDetalle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface VentaDetalleRepository extends JpaRepository<VentaDetalle, Long> {

    @Query("""
        SELECT vd.producto.id, vd.producto.nombre, SUM(vd.cantidad) AS totalVendido
        FROM VentaDetalle vd
        GROUP BY vd.producto.id, vd.producto.nombre
        ORDER BY totalVendido DESC
        """)
    List<Object[]> findTop10ProductosMasVendidos();

    @Query("""
        SELECT vd.producto.id, vd.producto.nombre, SUM(vd.subtotal) AS totalIngresos
        FROM VentaDetalle vd
        GROUP BY vd.producto.id, vd.producto.nombre
        ORDER BY totalIngresos DESC
        """)
    List<Object[]> findTop10ProductosPorIngresos();
}
