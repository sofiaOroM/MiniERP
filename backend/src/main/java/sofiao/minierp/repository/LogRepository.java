package sofiao.minierp.repository;

import sofiao.minierp.entity.Log;
import org.springframework.data.jpa.repository.JpaRepository;
import sofiao.minierp.entity.Modulo;

import java.util.List;

public interface LogRepository extends JpaRepository<Log, Long> {
    List<Log> findTop200ByOrderByFechaDesc();
    List<Log> findByModuloOrderByFechaDesc(Modulo modulo);
}
