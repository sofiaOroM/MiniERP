package sofiao.minierp.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "productos")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Producto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String codigo;

    @Column(nullable = false, length = 150)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(name = "unidad_medida", nullable = false, length = 20)
    private String unidadMedida;

    @Column(name = "precio_venta", nullable = false, precision = 12, scale = 2)
    private BigDecimal precioVenta;

    @Column(name = "costo_referencia", nullable = false, precision = 12, scale = 2)
    private BigDecimal costoReferencia;

    @Column(name = "stock_minimo", nullable = false)
    private Integer stockMinimo;

    @Column(nullable = false)
    private Boolean activo;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    /**
     * Regla de negocio del proyecto: producto_id par -> PEPS, impar -> UEPS.
     * Se calcula, NUNCA se persiste (evita redundancia/desincronización).
     */
    @Transient
    public MetodoCosteo getMetodoCosteo() {
        if (id == null) return null;
        return (id % 2 == 0) ? MetodoCosteo.PEPS : MetodoCosteo.UEPS;
    }

    @PrePersist
    void prePersist() {
        if (creadoEn == null) creadoEn = LocalDateTime.now();
        if (activo == null) activo = true;
        if (stockMinimo == null) stockMinimo = 5;
    }
}
