package sofiao.minierp.repository;

import sofiao.minierp.entity.CompraDetalle;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CompraDetalleRepository extends JpaRepository<CompraDetalle, Long> {

    @Query("""
        SELECT cd.producto.id, cd.producto.nombre, SUM(cd.cantidad) AS totalAdquirido
        FROM CompraDetalle cd
        GROUP BY cd.producto.id, cd.producto.nombre
        ORDER BY totalAdquirido DESC
        """)
    List<Object[]> findProductosAdquiridosConMasFrecuencia();
}

