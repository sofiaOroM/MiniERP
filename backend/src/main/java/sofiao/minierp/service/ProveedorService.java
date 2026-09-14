package sofiao.minierp.service;

import sofiao.minierp.dto.proveedor.ProveedorDTO;
import sofiao.minierp.entity.Accion;
import sofiao.minierp.entity.Log;
import sofiao.minierp.entity.Proveedor;
import sofiao.minierp.exception.ResourceNotFoundException;
import sofiao.minierp.repository.LogRepository;
import sofiao.minierp.repository.ProveedorRepository;
import sofiao.minierp.repository.UsuarioRepository;
import sofiao.minierp.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static sofiao.minierp.entity.Accion.*;
import static sofiao.minierp.entity.Modulo.PROVEEDORES;

@Service
@RequiredArgsConstructor
public class ProveedorService {

    private final ProveedorRepository proveedorRepository;
    private final UsuarioRepository usuarioRepository;
    private final LogRepository logRepository;

    @Transactional(readOnly = true)
    public List<Proveedor> listar() {
        return proveedorRepository.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public Proveedor obtener(Long id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado: " + id));
    }

    @Transactional
    public Proveedor crear(ProveedorDTO dto) {
        Proveedor proveedor = Proveedor.builder()
                .nombre(dto.nombre())
                .nit(dto.nit())
                .telefono(dto.telefono())
                .direccion(dto.direccion())
                .email(dto.email())
                .activo(true)
                .build();
        proveedor = proveedorRepository.save(proveedor);
        registrarLog(CREAR, "Proveedor creado: " + proveedor.getNombre());
        return proveedor;
    }

    @Transactional
    public Proveedor actualizar(Long id, ProveedorDTO dto) {
        Proveedor proveedor = obtener(id);
        proveedor.setNombre(dto.nombre());
        proveedor.setNit(dto.nit());
        proveedor.setTelefono(dto.telefono());
        proveedor.setDireccion(dto.direccion());
        proveedor.setEmail(dto.email());
        registrarLog(ACTUALIZAR, "Proveedor actualizado: " + proveedor.getNombre());
        return proveedor;
    }

    @Transactional
    public void eliminar(Long id) {
        // Baja lógica: el historial de compras conserva la referencia,
        // cumpliendo con "la información histórica deberá conservarse aún
        // cuando determinados elementos dejen de utilizarse".
        Proveedor proveedor = obtener(id);
        proveedor.setActivo(false);
        registrarLog(ELIMINAR, "Proveedor desactivado: " + proveedor.getNombre());
    }

    private void registrarLog(Accion accion, String descripcion) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        var usuario = usuarioRepository.findById(principal.getId()).orElseThrow();
        logRepository.save(Log.builder()
                .usuario(usuario)
                .modulo(PROVEEDORES)
                .accion(accion)
                .descripcion(descripcion)
                .build());
    }
}
