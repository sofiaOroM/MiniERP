package sofiao.minierp.service;

import sofiao.minierp.dto.producto.ProductoRequest;
import sofiao.minierp.dto.producto.ProductoResponse;
import sofiao.minierp.entity.*;
import sofiao.minierp.exception.ResourceNotFoundException;
import sofiao.minierp.repository.*;
import sofiao.minierp.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static sofiao.minierp.entity.Accion.*;
import static sofiao.minierp.entity.Modulo.PRODUCTOS;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;
    private final InventarioRepository inventarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final LogRepository logRepository;

    @Transactional(readOnly = true)
    public List<ProductoResponse> listar() {
        return productoRepository.findByActivoTrue().stream()
                .map(p -> ProductoResponse.from(p, existenciaDe(p.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtener(Long id) {
        Producto producto = buscarEntidad(id);
        return ProductoResponse.from(producto, existenciaDe(id));
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> conExistenciaBaja() {
        return productoRepository.findConExistenciaBaja().stream()
                .map(p -> ProductoResponse.from(p, existenciaDe(p.getId())))
                .toList();
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest req) {
        Categoria categoria = categoriaRepository.findById(req.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + req.categoriaId()));

        Producto producto = Producto.builder()
                .codigo(req.codigo())
                .nombre(req.nombre())
                .descripcion(req.descripcion())
                .categoria(categoria)
                .unidadMedida(req.unidadMedida() != null ? req.unidadMedida() : "UNIDAD")
                .precioVenta(req.precioVenta())
                .costoReferencia(req.costoReferencia() != null ? req.costoReferencia() : java.math.BigDecimal.ZERO)
                .stockMinimo(req.stockMinimo() != null ? req.stockMinimo() : 5)
                .activo(true)
                .build();
        producto = productoRepository.save(producto);

        // Toda alta de producto nace con su fila de inventario en cero;
        // las existencias solo suben cuando entra una compra real.
        inventarioRepository.save(Inventario.builder().producto(producto).existenciaActual(0).build());

        registrarLog(CREAR, "Producto creado: " + producto.getNombre() + " (" + producto.getMetodoCosteo() + ")");
        return ProductoResponse.from(producto, 0);
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest req) {
        Producto producto = buscarEntidad(id);
        Categoria categoria = categoriaRepository.findById(req.categoriaId())
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada: " + req.categoriaId()));

        producto.setNombre(req.nombre());
        producto.setDescripcion(req.descripcion());
        producto.setCategoria(categoria);
        if (req.unidadMedida() != null) producto.setUnidadMedida(req.unidadMedida());
        producto.setPrecioVenta(req.precioVenta());
        if (req.costoReferencia() != null) producto.setCostoReferencia(req.costoReferencia());
        if (req.stockMinimo() != null) producto.setStockMinimo(req.stockMinimo());

        registrarLog(ACTUALIZAR, "Producto actualizado: " + producto.getNombre());
        return ProductoResponse.from(producto, existenciaDe(id));
    }

    @Transactional
    public void eliminar(Long id) {
        // Baja lógica: conserva historial de compras/ventas/movimientos.
        Producto producto = buscarEntidad(id);
        producto.setActivo(false);
        registrarLog(ELIMINAR, "Producto desactivado: " + producto.getNombre());
    }

    private Producto buscarEntidad(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
    }

    private Integer existenciaDe(Long productoId) {
        return inventarioRepository.findByProductoId(productoId)
                .map(Inventario::getExistenciaActual)
                .orElse(0);
    }

    private void registrarLog(Accion accion, String descripcion) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        var usuario = usuarioRepository.findById(principal.getId()).orElseThrow();
        logRepository.save(Log.builder()
                .usuario(usuario).modulo(PRODUCTOS).accion(accion).descripcion(descripcion).build());
    }
}
