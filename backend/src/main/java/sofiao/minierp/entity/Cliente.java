package sofiao.minierp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "clientes")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Cliente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    // NIT NO es unique a nivel de BD: varios clientes pueden registrarse como "CF" (Consumidor Final)
    @Column(nullable = false, length = 20)
    private String nit;

    @Column(length = 30)
    private String telefono;

    @Column(length = 255)
    private String direccion;

    @Column(length = 120)
    private String email;

    @Column(nullable = false)
    private Boolean activo;

    @PrePersist
    void prePersist() {
        if (activo == null) activo = true;
    }
}
