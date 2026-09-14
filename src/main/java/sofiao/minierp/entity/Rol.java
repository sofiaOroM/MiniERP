package sofiao.minierp.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "roles")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String nombre; // ADMINISTRACION, COMPRAS, INVENTARIO, VENTAS

    @Column(length = 200)
    private String descripcion;
}
