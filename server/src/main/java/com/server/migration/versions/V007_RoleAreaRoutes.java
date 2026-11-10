package com.server.migration.versions;

import com.server.migration.DataMigration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Arayüzler role göre ayrılır (Frontend_Architecture.md §3): / public, /admin yönetim paneli, /user Mezun Portalı.
 * Yönetim menüleri /admin altına, portal menüleri /portal'dan /user'a taşınır. Yönetim paneli sadece ADMIN'e açık
 * olduğu için Anasayfa ve Tanımlar grubu da admin_only olur; USER'ın oturumuna sadece portal menüleri gelir.
 */
@Component
public class V007_RoleAreaRoutes implements DataMigration {

    private static final Map<String, String> ROUTES = Map.ofEntries(
            Map.entry("menu_home", "/admin"),
            Map.entry("menu_definitions", "/admin/definitions"),
            Map.entry("menu_categories", "/admin/definitions/categories"),
            Map.entry("menu_administration", "/admin/administration"),
            Map.entry("menu_users", "/admin/administration/users"),
            Map.entry("menu_portal", "/user"),
            Map.entry("menu_portal_home", "/user/home"),
            Map.entry("menu_portal_profile", "/user/profile"),
            Map.entry("menu_portal_services", "/user/services"),
            Map.entry("menu_portal_career", "/user/career"),
            Map.entry("menu_portal_events", "/user/events"),
            Map.entry("menu_portal_announcements", "/user/announcements"),
            Map.entry("menu_portal_messages", "/user/messages"),
            Map.entry("menu_portal_settings", "/user/settings"),
            Map.entry("menu_portal_help", "/user/help"));

    @Override
    public int version() {
        return 7;
    }

    @Override
    public String description() {
        return "Role göre arayüz route'ları: /admin ve /user";
    }

    @Override
    public void migrate(JdbcTemplate jdbc) {
        ROUTES.forEach((titleKey, route) -> jdbc.update("""
                UPDATE menus SET route = ?, version = version + 1, updated_at = now()
                 WHERE title_key = ? AND deleted = false""", route, titleKey));

        jdbc.update("""
                UPDATE menus SET admin_only = true, version = version + 1, updated_at = now()
                 WHERE title_key IN ('menu_home', 'menu_definitions', 'menu_categories') AND deleted = false""");
    }
}
