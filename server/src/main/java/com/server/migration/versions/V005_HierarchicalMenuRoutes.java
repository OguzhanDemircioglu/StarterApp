package com.server.migration.versions;

import com.server.migration.DataMigration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Menü route'ları frontend'in klasör ve URL ağacıyla aynı hale gelir (Frontend_Architecture.md §3):
 * /categories → /definitions/categories, /users → /administration/users.
 * Anasayfa da menüye eklenir; sidebar tamamen DB'den gelir. Menü ikonları PrimeIcons adlarına uyarlanır.
 */
@Component
public class V005_HierarchicalMenuRoutes implements DataMigration {

    @Override
    public int version() {
        return 5;
    }

    @Override
    public String description() {
        return "Hiyerarşik menü route'ları ve anasayfa menüsü";
    }

    @Override
    public void migrate(JdbcTemplate jdbc) {
        updateRoute(jdbc, "menu_definitions", "/definitions");
        updateRoute(jdbc, "menu_categories", "/definitions/categories");
        updateRoute(jdbc, "menu_administration", "/administration");
        updateRoute(jdbc, "menu_users", "/administration/users");

        // icon kolonu PrimeIcons adını tutar ("pi pi-" öneki olmadan); "settings" PrimeIcons'ta yok.
        jdbc.update("UPDATE menus SET icon = 'cog' WHERE title_key = 'menu_definitions' AND deleted = false");

        jdbc.update("""
                INSERT INTO menus (parent_id, title_key, route, icon, sort_order, admin_only, version, deleted, created_at)
                VALUES (NULL, 'menu_home', '/', 'home', 0, false, 0, false, now())""");
    }

    private static void updateRoute(JdbcTemplate jdbc, String titleKey, String route) {
        jdbc.update("""
                UPDATE menus SET route = ?, version = version + 1, updated_at = now()
                 WHERE title_key = ? AND deleted = false""", route, titleKey);
    }
}
