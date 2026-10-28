package com.server.modules.report;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Rapor sorguları native SQL'dir (Backend_Architecture.md §5.5):
 * - Toplama SQL'de yapılır, frontend'e sadece özet döner.
 * - Günler Türkiye saatine göre ayrılır; UTC'ye göre gruplamak gece 00:00-03:00 kayıtlarını önceki güne yazardı.
 * - generate_series ile kayıt olmayan günler de 0 olarak gelir.
 * - Native SQL'de soft delete filtresi otomatik değildir; "deleted = false" elle yazılır.
 */
@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final JdbcTemplate jdbc;

    @Override
    public List<PeriodValue> categoriesCreatedPerDay(int days) {
        return jdbc.query("""
                        SELECT to_char(d.day, 'YYYY-MM-DD') AS period, count(c.id) AS value
                          FROM generate_series(
                                   (now() AT TIME ZONE 'Europe/Istanbul')::date - ?,
                                   (now() AT TIME ZONE 'Europe/Istanbul')::date,
                                   interval '1 day') AS d(day)
                          LEFT JOIN categories c
                                 ON (c.created_at AT TIME ZONE 'Europe/Istanbul')::date = d.day::date
                                AND c.deleted = false
                         GROUP BY d.day
                         ORDER BY d.day""",
                (rs, row) -> new PeriodValue(rs.getString("period"), rs.getLong("value")),
                days - 1);
    }
}
