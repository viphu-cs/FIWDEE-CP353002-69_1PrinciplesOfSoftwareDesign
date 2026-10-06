package com.fiwdee.service;

import java.time.LocalDateTime;

/**
 * Tracks currently logged-in users (online sessions) for the Admin Users summary.
 * JWT is stateless, so "online" means the account presented a valid token
 * within the configured window (fiwdee.security.online-window-minutes, default 15).
 */
public interface UserSessionService {

    /**
     * Records activity for the user — creates a session if none is active,
     * or refreshes the last-seen timestamp of the existing one.
     */
    void touch(Long userId);

    /** True when the user has been active within the online window. */
    boolean isOnline(Long userId);

    /** Start time of the current session, or null when offline. */
    LocalDateTime getSessionStart(Long userId);

    /** Force-ends the user's active session (Admin force logout). */
    void endSession(Long userId);
}
