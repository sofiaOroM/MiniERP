package sofiao.minierp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generarToken(UserPrincipal principal) {
        Date ahora = new Date();
        Date expira = new Date(ahora.getTime() + expirationMs);

        return Jwts.builder()
                .subject(principal.getUsername())
                .claim("userId", principal.getId())
                .claim("rol", principal.getRolNombre())
                .claim("nombre", principal.getNombreCompleto())
                .issuedAt(ahora)
                .expiration(expira)
                .signWith(key(), Jwts.SIG.HS256) // API no deprecada de jjwt 0.12+ (io.jsonwebtoken.Jwts.SIG)
                .compact();
    }

    public String extraerUsername(String token) {
        return parseClaims(token).getSubject();
    }

    public String extraerRol(String token) {
        return parseClaims(token).get("rol", String.class);
    }

    public boolean esTokenValido(String token, String username) {
        Claims claims = parseClaims(token);
        return claims.getSubject().equals(username) && !claims.getExpiration().before(new Date());
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}

