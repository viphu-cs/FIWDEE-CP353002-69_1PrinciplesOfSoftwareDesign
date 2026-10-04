package com.fiwdee.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when domain validation fails (HTTP 400).
 */
public class ValidationException extends BusinessException {

    public ValidationException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
