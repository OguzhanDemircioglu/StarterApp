package com.server;

import com.server.modules.auth.LoginAttempt;
import com.server.modules.auth.LoginAttemptRepository;
import com.server.modules.report.PeriodValue;
import com.server.modules.report.ReportService;
import com.server.support.TestJwtKeys;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Dev profilindeki H2 ayarlarıyla (bellekte) açılır: PostgreSQL'den farklı davranan yerlerin H2'de çalıştığını gösterir.
 * Docker gerektirmez.
 */
@SpringBootTest
class H2IntegrationTest {

    private static final int MAX_ATTEMPTS = 3;

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", () -> "jdbc:h2:mem:starterapp;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;"
                + "DEFAULT_NULL_ORDERING=HIGH;DB_CLOSE_ON_EXIT=FALSE;DB_CLOSE_DELAY=-1;"
                + "INIT=CREATE SCHEMA IF NOT EXISTS starterapp");
        registry.add("spring.datasource.username", () -> "sa");
        registry.add("spring.datasource.password", () -> "");
        registry.add("DB_SCHEMA", () -> "starterapp");
        registry.add("app.admin.email", () -> "admin@test.local");
        registry.add("app.admin.password", () -> "Admin12345");
        TestJwtKeys.register(registry);
    }

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private LoginAttemptRepository attempts;

    @Autowired
    private ReportService reports;

    @Test
    void migrationsAreApplied() {
        List<Integer> versions = jdbc.queryForList("SELECT version FROM data_migration_history ORDER BY version", Integer.class);
        assertThat(versions).containsExactly(1, 2, 3, 4, 5);
    }

    @Test
    void uniqueIndexAppliesOnlyToNotDeletedRows() {
        insertCategory("Aynı Ad");
        assertThatThrownBy(() -> insertCategory("Aynı Ad")).isInstanceOf(DuplicateKeyException.class);

        jdbc.update("UPDATE categories SET deleted = true WHERE name = 'Aynı Ad'");
        insertCategory("Aynı Ad");

        assertThat(jdbc.queryForObject("SELECT count(*) FROM categories WHERE name = 'Aynı Ad'", Integer.class)).isEqualTo(2);
    }

    @Test
    void failuresAreCountedThenBlockedAndResetAfterBlockExpires() {
        String key = "h2-test-key";
        Instant now = Instant.now().truncatedTo(ChronoUnit.MILLIS);
        Instant blockedUntil = now.plus(1, ChronoUnit.HOURS);

        attempts.recordFailure(key, now, blockedUntil, MAX_ATTEMPTS);
        attempts.recordFailure(key, now, blockedUntil, MAX_ATTEMPTS);
        assertThat(attempt(key).isBlocked(now)).isFalse();

        attempts.recordFailure(key, now, blockedUntil, MAX_ATTEMPTS);
        assertThat(attempt(key).isBlocked(now)).isTrue();

        Instant afterBlock = blockedUntil.plusSeconds(1);
        attempts.recordFailure(key, afterBlock, afterBlock.plus(1, ChronoUnit.HOURS), MAX_ATTEMPTS);
        assertThat(attempt(key).isBlocked(afterBlock)).isFalse();
        assertThat(jdbc.queryForObject("SELECT fail_count FROM login_attempts WHERE attempt_key = ?", Integer.class, key))
                .isEqualTo(1);
    }

    @Test
    void reportReturnsEveryDayAndCountsToday() {
        insertCategory("Rapor Kategorisi");

        List<PeriodValue> values = reports.categoriesCreatedPerDay(7);

        LocalDate today = LocalDate.now(ZoneId.of("Europe/Istanbul"));
        assertThat(values).hasSize(7);
        assertThat(values.getFirst().period()).isEqualTo(today.minusDays(6).toString());
        assertThat(values.getFirst().value()).isZero();
        assertThat(values.getLast().period()).isEqualTo(today.toString());
        assertThat(values.getLast().value()).isPositive();
    }

    private LoginAttempt attempt(String key) {
        return attempts.findById(key).orElseThrow();
    }

    private void insertCategory(String name) {
        jdbc.update("INSERT INTO categories (name, version, deleted, created_at) VALUES (?, 0, false, now())", name);
    }
}
