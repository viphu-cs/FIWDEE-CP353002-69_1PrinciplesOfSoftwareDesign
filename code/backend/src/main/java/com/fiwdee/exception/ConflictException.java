package com.fiwdee.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a state conflict or resource collision occurs (HTTP 409).
 */
public class ConflictException extends BusinessException {

    public ConflictException(String message) {
        super(message, HttpStatus.CONFLICT);
    }
}
