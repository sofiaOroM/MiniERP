package sofiao.minierp.security;

import sofiao.minierp.entity.Usuario;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class UserPrincipal implements UserDetails {

    private final Usuario usuario;

    public UserPrincipal(Usuario usuario) {
        this.usuario = usuario;
    }

    public Long getId() { return usuario.getId(); }
    public String getNombreCompleto() { return usuario.getNombre(); }
    public String getRolNombre() { return usuario.getRol().getNombre(); }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Prefijo ROLE_ requerido por hasRole()/hasAnyRole() de Spring Security
        return List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRol().getNombre()));
    }

    @Override
    public String getPassword() { return usuario.getPasswordHash(); }

    @Override
    public String getUsername() { return usuario.getUsername(); }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return usuario.getActivo(); }
}