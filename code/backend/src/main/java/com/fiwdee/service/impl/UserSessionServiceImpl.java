package com.fiwdee.service.impl;

import com.fiwdee.service.UserSessionService;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * In-memory online-session registry (single-node deployment).
 * Sessions expire implicitly: a user counts as online while their
 * last authenticated request is inside the online window.
 */
@Service
public class UserSessionServiceImpl implements UserSessionService {

    private static class SessionRecord {
        private LocalDateTime firstSeenAt;
        private LocalDateTime lastSeenAt;

        private SessionRecord(LocalDateTime now) {
            this.firstSeenAt = now;
            this.lastSeenAt = now;
        }
    }

    private final Map<Long, SessionRecord> sessions = new ConcurrentHashMap<>();
    private final int onlineWindowMinutes;

    public UserSessionServiceImpl(
            @Value("${fiwdee.security.online-window-minutes:15}") int onlineWindowMinutes) {
        this.onlineWindowMinutes = onlineWindowMinutes;
    }

    @Override
    public void touch(Long userId) {
        LocalDateTime now = LocalDateTime.now();
        sessions.compute(userId, (id, record) -> {
            if (record == null || expired(record, now)) {
                return new SessionRecord(now);
            }
            record.lastSeenAt = now;
            return record;
        });
    }

    @Override
    public boolean isOnline(Long userId) {
        SessionRecord record = sessions.get(userId);
        return record != null && !expired(record, LocalDateTime.now());
    }

    @Override
    public LocalDateTime getSessionStart(Long userId) {
        SessionRecord record = sessions.get(userId);
        return record != null && !expired(record, LocalDateTime.now()) ? record.firstSeenAt : null;
    }

    @Override
    public void endSession(Long userId) {
        sessions.remove(userId);
    }

    private boolean expired(SessionRecord record, LocalDateTime now) {
        return Duration.between(record.lastSeenAt, now).toMinutes() >= onlineWindowMinutes;
    }
}
