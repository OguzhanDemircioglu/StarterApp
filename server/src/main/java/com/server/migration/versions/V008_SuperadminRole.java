package com.server.migration.versions;

import com.server.migration.DataMigration;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * SUPERADMIN rolü (kapalı ağdaki yönetim paneli; ADMIN'in bütün yetkileri + yönetici hesaplarını yönetme).
 * <ul>
 *   <li>users.role kolonu yeni rolü kabul edecek şekilde yeniden kurulur. Hibernate kolonu tablo oluşturulurken enum
 *       değerlerinden üretir ve sonradan güncellemez: PostgreSQL'de VARCHAR + CHECK kısıtı, H2'de ise yerel
 *       ENUM('ADMIN', 'USER') tipi olur. Önce rol kısıtları kaldırılır (adı veritabanına göre değiştiği için
 *       information_schema'dan bulunur), kolon iki veritabanında da VARCHAR(20) yapılır, sonra kısıt yeniden eklenir.</li>
 *   <li>İlk yönetici (en eski ADMIN, V002) SUPERADMIN olur.</li>
 * </ul>
 */
@Component
public class V008_SuperadminRole implements DataMigration {

    @Override
    public int version() {
        return 8;
    }

    @Override
    public String description() {
        return "SUPERADMIN rolü ve ilk yöneticinin süper yönetici yapılması";
    }

    @Override
    public void migrate(JdbcTemplate jdbc) {
        // NOT NULL kısıtları da CHECK olarak listelenebilir; sadece rol değerlerini içeren kısıt alınır.
        List<String> constraints = jdbc.queryForList("""
                SELECT tc.constraint_name
                  FROM information_schema.table_constraints tc
                  JOIN information_schema.check_constraints cc
                    ON cc.constraint_schema = tc.constraint_schema AND cc.constraint_name = tc.constraint_name
                 WHERE tc.table_schema = current_schema()
                   AND lower(tc.table_name) = 'users'
                   AND tc.constraint_type = 'CHECK'
                   AND upper(cc.check_clause) LIKE '%ADMIN%'""", String.class);
        for (String name : constraints) {
            jdbc.execute("ALTER TABLE users DROP CONSTRAINT \"" + name + "\"");
        }
        // H2'nin ENUM tipi yeni değeri kabul etmez; PostgreSQL'de kolon zaten VARCHAR(20)'dir (işlem etkisizdir).
        jdbc.execute("ALTER TABLE users ALTER COLUMN role SET DATA TYPE VARCHAR(20)");
        jdbc.execute("""
                ALTER TABLE users ADD CONSTRAINT users_role_check
                    CHECK (role IN ('SUPERADMIN', 'ADMIN', 'USER'))""");

        jdbc.update("""
                UPDATE users SET role = 'SUPERADMIN', version = version + 1, updated_at = now()
                 WHERE id = (SELECT min(id) FROM users WHERE role = 'ADMIN' AND deleted = false)""");
    }
}
