package sofiao.minierp.repository;

import sofiao.minierp.entity.Inventario;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface InventarioRepository extends JpaRepository<Inventario, Long> {

    Optional<Inventario> findByProductoId(Long productoId);

    /**
     * Bloqueo pesimista de fila: se usa antes de validar/afectar existencias
     * en una venta o compra, para evitar sobreventa por condiciones de carrera
     * cuando dos usuarios registran movimientos del mismo producto a la vez.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventario i WHERE i.producto.id = :productoId")
    Optional<Inventario> findByProductoIdForUpdate(Long productoId);
}
