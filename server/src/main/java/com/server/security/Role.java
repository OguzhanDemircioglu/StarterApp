package com.server.security;

/**
 * Sistemdeki roller. Her kullanıcının tek rolü vardır.
 * Admin'e özel endpoint'ler @PreAuthorize("hasRole('ADMIN')") ile işaretlenir.
 */
public enum Role {
    ADMIN,
    USER
}
