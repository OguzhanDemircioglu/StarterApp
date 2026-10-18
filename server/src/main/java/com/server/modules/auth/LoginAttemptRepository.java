package com.server.modules.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

public interface LoginAttemptRepository extends JpaRepository<LoginAttempt, String> {

    /**
     * Yanlış denemeyi atomik olarak sayar. Engel süresi dolmuşsa sayaç 1'den başlar;
     * sayaç maxAttempts'e ulaşınca blocked_until yazılır.
     */
    @Transactional
    @Modifying
    @Query(nativeQuery = true, value = """
            INSERT INTO login_attempts (attempt_key, fail_count, blocked_until, updated_at)
            VALUES (:key, 1, NULL, :now)
            ON CONFLICT (attempt_key) DO UPDATE SET
                fail_count = CASE
                    WHEN login_attempts.blocked_until <= :now THEN 1
                    ELSE login_attempts.fail_count + 1 END,
                blocked_until = CASE
                    WHEN login_attempts.blocked_until <= :now THEN NULL
                    WHEN login_attempts.fail_count + 1 >= :maxAttempts THEN :blockedUntil
                    ELSE login_attempts.blocked_until END,
                updated_at = :now""")
    void recordFailure(String key, Instant now, Instant blockedUntil, int maxAttempts);

    @Transactional
    @Modifying
    @Query("delete from LoginAttempt a where a.updatedAt < :before")
    int deleteOlderThan(Instant before);
}
