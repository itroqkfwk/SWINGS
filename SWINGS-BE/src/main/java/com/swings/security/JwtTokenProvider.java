package com.swings.security;

import com.swings.config.SecretValueResolver;
import com.swings.user.entity.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final Logger logger = LoggerFactory.getLogger(JwtTokenProvider.class);

    private final SecretValueResolver secretValueResolver;

    @Value("${jwt.secret:}")
    private String secretKeyValue;

    @Value("${jwt.secret-file:}")
    private String secretKeyLocation;

    @Value("${jwt.expiration}")
    private long expirationTime;

    private Key signingKey;

    public JwtTokenProvider(SecretValueResolver secretValueResolver) {
        this.secretValueResolver = secretValueResolver;
    }

    @PostConstruct
    public void init() {
        try {
            String secretKey = secretValueResolver.resolveRequiredSecret(
                    "JWT secret",
                    secretKeyValue,
                    secretKeyLocation
            );

            this.signingKey = Keys.hmacShaKeyFor(secretKey.getBytes(StandardCharsets.UTF_8));
            logger.info("JWT secret initialized");
        } catch (Exception e) {
            logger.error("Failed to initialize JWT secret: {}", e.getMessage());
            throw new RuntimeException("JWT secret initialization failed", e);
        }
    }

    public String generateToken(String username, UserEntity.Role role) {
        return Jwts.builder()
                .setSubject(username)
                .claim("role", role.name())
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateRefreshToken(String username) {
        long refreshTokenExpiration = 7 * 24 * 60 * 60 * 1000L;
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(signingKey).build().parseClaimsJws(token);
            return true;
        } catch (ExpiredJwtException e) {
            logger.warn("Expired JWT: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            logger.warn("Unsupported JWT: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            logger.warn("Malformed JWT: {}", e.getMessage());
        } catch (SignatureException e) {
            logger.warn("JWT signature validation failed: {}", e.getMessage());
        } catch (Exception e) {
            logger.warn("JWT validation failed: {}", e.getMessage());
        }
        return false;
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }
}
