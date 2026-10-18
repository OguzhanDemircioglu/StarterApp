package com.server.modules.user;

import java.util.Locale;

/**
 * E-posta adresleri küçük harfe çevrilip trim edilerek saklanır ve karşılaştırılır.
 * Locale.ROOT bilinçli: Türkçe locale'de "I" harfi "ı" olurdu ve adres bozulurdu.
 */
public final class Emails {

    private Emails() {
    }

    public static String normalize(String email) {
        return email == null ? null : email.trim().toLowerCase(Locale.ROOT);
    }
}
