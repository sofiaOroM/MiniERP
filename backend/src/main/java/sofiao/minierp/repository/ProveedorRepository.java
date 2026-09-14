package sofiao.minierp.repository;

import sofiao.minierp.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProveedorRepository extends JpaRepository<Proveedor, Long> {
    List<Proveedor> findByActivoTrue();
    Optional<Proveedor> findByNit(String nit);
}