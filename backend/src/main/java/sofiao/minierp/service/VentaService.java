package sofiao.minierp.service;

import sofiao.minierp.dto.venta.VentaRequest;
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
import java.time.format.DateTimeFormatter;
import java.util.List;

import static sofiao.minierp.entity.Accion.CREAR;
import static sofiao.minierp.entity.Modulo.VENTAS;

@Service
@RequiredArgsConstructor
public class VentaService {

    private static final BigDecimal IVA_RATE = new BigDecimal("0.12");

    private final VentaRepository ventaRepository;
    private final ClienteRepository clienteRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;
    private final LogRepository logRepository;
    private final InventarioService inventarioService;
    private final PdfFacturaService pdfFacturaService;

    @Transactional
    public Venta registrar(VentaRequest request) {
        Cliente cliente = clienteRepository.findById(request.clienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + request.clienteId()));
        Usuario usuario = usuarioActual();

        // 1) Resolver productos y congelar el precio de venta del catálogo
        record LineaResuelta(Producto producto, int cantidad, BigDecimal precioUnitario, BigDecimal subtotal) {}
        List<LineaResuelta> lineas = request.detalles().stream().map(l -> {
            Producto producto = productoRepository.findById(l.productoId())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + l.productoId()));
            BigDecimal subtotalLinea = producto.getPrecioVenta()
                    .multiply(BigDecimal.valueOf(l.cantidad()))
                    .setScale(2, RoundingMode.HALF_UP);
            return new LineaResuelta(producto, l.cantidad(), producto.getPrecioVenta(), subtotalLinea);
        }).toList();

        // 2) Garantizar disponibilidad de todas las líneas antes de completar la operación.
        for (LineaResuelta linea : lineas) {
            inventarioService.validarDisponibilidad(linea.producto(), linea.cantidad());
        }

        // 3) Armar cabecera y detalle y calcular totales
        BigDecimal subtotal = lineas.stream().map(LineaResuelta::subtotal).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal iva = subtotal.multiply(IVA_RATE).setScale(2, RoundingMode.HALF_UP);

        Venta venta = Venta.builder()
                .cliente(cliente)
                .usuario(usuario)
                .numeroFactura(generarNumeroFactura())
                .fecha(LocalDateTime.now())
                .subtotal(subtotal)
                .iva(iva)
                .total(subtotal.add(iva))
                .build();

        for (LineaResuelta linea : lineas) {
            venta.addDetalle(VentaDetalle.builder()
                    .producto(linea.producto())
                    .cantidad(linea.cantidad())
                    .precioUnitario(linea.precioUnitario())
                    .subtotal(linea.subtotal())
                    .build());
        }

        venta = ventaRepository.save(venta); // asigna IDs a venta y venta_detalle

        // 4) Registrar la salida de inventario por cada línea (aquí se aplica
        //    UEPS/PEPS y la validación definitiva con bloqueo de fila).
        for (VentaDetalle detalle : venta.getDetalles()) {
            inventarioService.registrarSalidaPorVenta(detalle, usuario);
        }

        // 5) Generar la factura en PDF y guardar la ruta
        String pdfPath = pdfFacturaService.generar(venta);
        venta.setPdfPath(pdfPath);
        venta = ventaRepository.save(venta);

        registrarLog(CREAR, "Venta registrada: " + venta.getNumeroFactura() + " a " + cliente.getNombre());
        return venta;
    }

    @Transactional(readOnly = true)
    public List<Venta> buscarPorRangoFechas(LocalDateTime desde, LocalDateTime hasta) {
        return ventaRepository.findByFechaBetween(desde, hasta);
    }

    @Transactional(readOnly = true)
    public List<Object[]> top10ClientesPorMonto() {
        return ventaRepository.findTop10ClientesPorMonto();
    }

    private String generarNumeroFactura() {
        String ts = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS"));
        return "FAC-" + ts;
    }

    private Usuario usuarioActual() {
        UserPrincipal principal = (UserPrincipal) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return usuarioRepository.findById(principal.getId()).orElseThrow();
    }

    private void registrarLog(Accion accion, String descripcion) {
        logRepository.save(Log.builder()
                .usuario(usuarioActual())
                .modulo(VENTAS)
                .accion(accion)
                .descripcion(descripcion)
                .build());
    }
}
