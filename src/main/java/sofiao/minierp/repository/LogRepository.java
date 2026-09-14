package sofiao.minierp.repository;

import sofiao.minierp.entity.Log;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LogRepository extends JpaRepository<Log, Long> {
    List<Log> findTop200ByOrderByFechaDesc();
    List<Log> findByModuloOrderByFechaDesc(String modulo);
}
