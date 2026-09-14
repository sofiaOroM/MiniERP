package sofiao.minierp.service;

import sofiao.minierp.dto.cliente.ClienteDTO;
import sofiao.minierp.entity.Accion;
import sofiao.minierp.entity.Cliente;
import sofiao.minierp.entity.Log;
import sofiao.minierp.exception.ResourceNotFoundException;
import sofiao.minierp.repository.ClienteRepository;
import sofiao.minierp.repository.LogRepository;
import sofiao.minierp.repository.UsuarioRepository;
import sofiao.minierp.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static sofiao.minierp.entity.Accion.*;
import static sofiao.minierp.entity.Modulo.*;

@Service
@RequiredArgsConstructor
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final LogRepository logRepository;

    @Transactional(readOnly = true)
    public List<Cliente> listar() {
        return clienteRepository.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public Cliente obtener(Long id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + id));
    }

    @Transactional
    public Cliente crear(ClienteDTO dto) {
        Cliente cliente = Cliente.builder()
                .nombre(dto.nombre()).nit(dto.nit()).telefono(dto.telefono())
                .direccion(dto.direccion()).email(dto.email()).activo(true).build();
        cliente = clienteRepository.save(cliente);
        registrarLog(CREAR, "Cliente creado: " + cliente.getNombre());
        return cliente;
    }

    @Transactional
    public Cliente actualizar(Long id, ClienteDTO dto) {
        Cliente cliente = obtener(id);
        cliente.setNombre(dto.nombre());
        cliente.setNit(dto.nit());
        cliente.setTelefono(dto.telefono());
        cliente.setDireccion(dto.direccion());
        cliente.setEmail(dto.email());
        registrarLog(ACTUALIZAR, "Cliente actualizado: " + cliente.getNombre());
        return cliente;
    }

    @Transactional
    public void eliminar(Long id) {
        Cliente cliente = obtener(id);
        cliente.setActivo(false); // baja lógica: conserva historial de ventas
        registrarLog(ELIMINAR, "Cliente desactivado: " + cliente.getNombre());
    }

    private void registrarLog(Accion accion, String descripcion) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        UserPrincipal principal = (UserPrincipal) auth.getPrincipal();
        var usuario = usuarioRepository.findById(principal.getId()).orElseThrow();
        logRepository.save(Log.builder()
                .usuario(usuario).modulo(CLIENTES).accion(accion).descripcion(descripcion).build());
    }
}
