package com.server.security;

import java.util.Locale;

/**
 * Uygulamanın hangi yüzey için çalıştığı (APP_SURFACE). Aynı imaj iki ayrı yerde, iki ayrı modda çalışır:
 * <ul>
 *   <li>PUBLIC: dışarıya açık sunucu. Sadece USER giriş yapar, kayıt açıktır, /api/admin/** hiç sunulmaz.</li>
 *   <li>INTERNAL: kapalı ağdaki sunucu. Sadece ADMIN ve SUPERADMIN giriş yapar, kayıt ve /api/portal/** kapalıdır.</li>
 *   <li>ALL: sadece yerel geliştirme ve testler; iki yüzey birlikte. Prod'da kullanılmaz.</li>
 * </ul>
 */
public enum Surface {
    PUBLIC,
    INTERNAL,
    ALL;

    /** "public", "internal", "all" (büyük/küçük harf fark etmez). */
    public static Surface parse(String value) {
        return valueOf(value.trim().toUpperCase(Locale.ROOT));
    }

    /** Bu yüzeyde bu rol giriş yapabilir mi? */
    public boolean allowsLogin(Role role) {
        return switch (this) {
            case PUBLIC -> role == Role.USER;
            case INTERNAL -> role.isStaff();
            case ALL -> true;
        };
    }

    /** Yönetim API'leri (/api/admin/**) bu yüzeyde var mı? */
    public boolean servesAdmin() {
        return this != PUBLIC;
    }

    /** Kayıt ve portal API'leri (/api/auth/register, /api/portal/**) bu yüzeyde var mı? */
    public boolean servesPortal() {
        return this != INTERNAL;
    }
}
