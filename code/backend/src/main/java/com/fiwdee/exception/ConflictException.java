package com.fiwdee.exception;

/** Raised when the requested state conflicts with existing data. */
public class ConflictException extends BusinessException {

    public ConflictException(String message) {
        super(message);
    }
}
