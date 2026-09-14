package sofiao.minierp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "proveedores")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(nullable = false, unique = true, length = 20)
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
