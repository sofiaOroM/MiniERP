package sofiao.minierp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "lotes_inventario")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LoteInventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "compra_detalle_id")
    private CompraDetalle compraDetalle;

    @Column(name = "cantidad_inicial", nullable = false)
    private Integer cantidadInicial;

    @Column(name = "cantidad_disponible", nullable = false)
    private Integer cantidadDisponible;

    @Column(name = "costo_unitario", nullable = false, precision = 12, scale = 2)
    private BigDecimal costoUnitario;

    @Column(name = "fecha_ingreso", nullable = false)
    private LocalDateTime fechaIngreso;

    @PrePersist
    void prePersist() {
        if (fechaIngreso == null) fechaIngreso = LocalDateTime.now();
    }
}