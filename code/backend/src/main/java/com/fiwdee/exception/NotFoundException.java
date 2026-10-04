package com.fiwdee.exception;

/** Raised when a requested domain resource does not exist. */
public class NotFoundException extends BusinessException {

    public NotFoundException(String message) {
        super(message);
    }
}
