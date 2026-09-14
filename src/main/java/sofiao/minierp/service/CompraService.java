package sofiao.minierp.service;

import sofiao.minierp.dto.compra.CompraDetalleRequest;
import sofiao.minierp.dto.compra.CompraRequest;
import sofiao.minierp.entity.*;
import sofiao.minierp.exception.ResourceNotFoundException;
import sofiao.minierp.repository.*;
import sofiao.minierp.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import static sofiao.minierp.entity.Accion.*;
import static sofiao.minierp.entity.Modulo.*;

@Service
@RequiredArgsConstructor
public class CompraService {

    private static final BigDecimal IVA_RATE = new BigDecimal("0.12");

    private final CompraRepository compraRepository;
    private final ProveedorRepository proveedorRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LogRepository logRepository;
    private final InventarioService inventarioService;

    /**
     * Registra una compra completa (cabecera y detalle) y, por cada línea,
     * genera la entrada en inventario. Todo dentro de una
     * sola transacción: si algo falla a mitad de camino, no queda ni la
     * compra ni movimientos de inventario a medias.
     */
    @Transactional
    public Compra registrar(CompraRequest request) {
        Proveedor proveedor = proveedorRepository.findById(request.proveedorId())
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado: " + request.proveedorId()));
        Usuario usuario = usuarioActual();

        Compra compra = Compra.builder()
                .proveedor(proveedor)
                .usuario(usuario)
                .numeroDocumento(request.numeroDocumento())
                .fecha(LocalDateTime.now())
                .subtotal(BigDecimal.ZERO)
                .iva(BigDecimal.ZERO)
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;

        for (CompraDetalleRequest lineaReq : request.detalles()) {
            Producto producto = productoRepository.findById(lineaReq.productoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + lineaReq.productoId()));

            BigDecimal subtotalLinea = lineaReq.precioUnitario()
                    .multiply(BigDecimal.valueOf(lineaReq.cantidad()))
                    .setScale(2, RoundingMode.HALF_UP);

            CompraDetalle detalle = CompraDetalle.builder()
                    .producto(producto)
                    .cantidad(lineaReq.cantidad())
                    .precioUnitario(lineaReq.precioUnitario())
                    .subtotal(subtotalLinea)
                    .build();
            compra.addDetalle(detalle);
            subtotal = subtotal.add(subtotalLinea);
        }

        BigDecimal iva = subtotal.multiply(IVA_RATE).setScale(2, RoundingMode.HALF_UP);
        compra.setSubtotal(subtotal);
        compra.setIva(iva);
        compra.setTotal(subtotal.add(iva));

        compra = compraRepository.save(compra); // asigna IDs a compra y a cada compra_detalle

        // Recién con IDs asignados se puede generar el lote/movimiento por línea
        for (CompraDetalle detalle : compra.getDetalles()) {
            inventarioService.registrarEntradaPorCompra(detalle, usuario);
        }

        registrarLog(CREAR, "Compra registrada: " + compra.getNumeroDocumento() + " a " + proveedor.getNombre());
        return compra;
    }

    @Transactional(readOnly = true)
    public List<Compra> buscarPorRangoFechas(LocalDateTime desde, LocalDateTime hasta) {
        return compraRepository.findByFechaBetween(desde, hasta);
    }

    @Transactional(readOnly = true)
    public List<Object[]> top5ProveedoresPorMonto() {
        return compraRepository.findTop5ProveedoresPorMonto();
    }

    private Usuario usuarioActual() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return usuarioRepository.findById(principal.getId()).orElseThrow();
    }

    private void registrarLog(Accion accion, String descripcion) {
        logRepository.save(Log.builder()
                .usuario(usuarioActual())
                .modulo(COMPRAS)
                .accion(accion)
                .descripcion(descripcion)
                .build());
    }
}
