package sofiao.minierp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "logs")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Log {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @Enumerated(EnumType.STRING)
    @Column(name = "modulo", nullable = false, length = 50)
    private Modulo modulo;

    @Enumerated(EnumType.STRING)
    @Column(name = "accion", nullable = false, length = 50)
    private Accion accion;

    @Column(name = "descripcion", length = 500)
    private String descripcion;

    @Column(nullable = false)
    private LocalDateTime fecha;

    @PrePersist
    void prePersist() {
        if (fecha == null) fecha = LocalDateTime.now();
    }

}
