package com.server.security;

/**
 * Sistemdeki roller. Her kullanıcının tek rolü vardır.
 * <pre>
 *   SUPERADMIN ── ADMIN        (kapalı ağ, yönetim paneli)
 *   USER                       (dışarıya açık Mezun Portalı)
 * </pre>
 * SUPERADMIN, ADMIN'in bütün yetkilerini taşır (SecurityConfig'teki RoleHierarchy). ADMIN ve SUPERADMIN bilerek USER
 * yetkisi taşımaz: yönetim kullanıcıları portala giremez, mezun gibi davranamaz.
 * Yönetim endpoint'leri /api/admin/** altındadır ve hasRole('ADMIN') ister; portal endpoint'leri /api/portal/** altındadır
 * ve hasRole('USER') ister.
 */
public enum Role {
    SUPERADMIN,
    ADMIN,
    USER;

    /** Yönetim paneli kullanıcısı mı (ADMIN ya da SUPERADMIN)? */
    public boolean isStaff() {
        return this == SUPERADMIN || this == ADMIN;
    }
}
