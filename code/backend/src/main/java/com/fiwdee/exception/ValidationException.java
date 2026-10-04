package com.fiwdee.exception;

/** Raised when an operation violates a business validation rule. */
public class ValidationException extends BusinessException {

    public ValidationException(String message) {
        super(message);
    }
}
