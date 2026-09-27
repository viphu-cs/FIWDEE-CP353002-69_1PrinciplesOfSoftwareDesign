package com.fiwdee.domain.enums;

/**
 * QueueStatus defines the progression of a customer in the daily front-desk queue.
 */
public enum QueueStatus {
    WAITING,
    CALLED,
    IN_SERVICE,
    COMPLETED,
    CANCELLED
}
