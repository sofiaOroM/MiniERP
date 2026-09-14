package sofiao.minierp.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * existencia_actual es un dato denormalizado: la fuente de verdad real es
 * SUM(lotes_inventario.cantidad_disponible) para ese producto. Un trigger de
 * Postgres (trg_sync_inventario) mantiene esta columna sincronizada cada vez
 * que cambia un lote, por lo que esta entidad nunca se actualiza
 * manualmente desde el código Java: solo se lee.
 */
@Entity
@Table(name = "inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false, unique = true)
    private Producto producto;

    @Column(name = "existencia_actual", nullable = false)
    private Integer existenciaActual;
}