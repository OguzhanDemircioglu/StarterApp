package com.server.migration.versions;

import com.server.migration.DataMigration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Mezun Portalı menüleri (client: pages/portal). Kök menü /portal, alt menüler portalın sol menüsüdür.
 * USER portalda sadece bu grubun çocuklarını görür; ADMIN kendi sidebar'ında grubu görür ve önizleme için açar.
 */
@Component
public class V006_PortalMenus implements DataMigration {

    @Override
    public int version() {
        return 6;
    }

    @Override
    public String description() {
        return "Mezun Portalı menüleri";
    }

    @Override
    public void migrate(JdbcTemplate jdbc) {
        jdbc.update("""
                INSERT INTO menus (parent_id, title_key, route, icon, sort_order, admin_only, version, deleted, created_at)
                VALUES (NULL, 'menu_portal', '/portal', 'idcard', 2, false, 0, false, now())""");

        insertChild(jdbc, "menu_portal_home", "/portal/home", "home", 1);
        insertChild(jdbc, "menu_portal_profile", "/portal/profile", "user", 2);
        insertChild(jdbc, "menu_portal_services", "/portal/services", "profile", 3);
        insertChild(jdbc, "menu_portal_career", "/portal/career", "solution", 4);
        insertChild(jdbc, "menu_portal_events", "/portal/events", "calendar", 5);
        insertChild(jdbc, "menu_portal_announcements", "/portal/announcements", "notification", 6);
        insertChild(jdbc, "menu_portal_messages", "/portal/messages", "mail", 7);
        insertChild(jdbc, "menu_portal_settings", "/portal/settings", "setting", 8);
        insertChild(jdbc, "menu_portal_help", "/portal/help", "question-circle", 9);
    }

    private static void insertChild(JdbcTemplate jdbc, String titleKey, String route, String icon, int sortOrder) {
        jdbc.update("""
                INSERT INTO menus (parent_id, title_key, route, icon, sort_order, admin_only, version, deleted, created_at)
                VALUES ((SELECT id FROM menus WHERE title_key = 'menu_portal' AND deleted = false),
                        ?, ?, ?, ?, false, 0, false, now())""", titleKey, route, icon, sortOrder);
    }
}
