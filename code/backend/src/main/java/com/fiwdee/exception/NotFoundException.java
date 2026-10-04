package com.fiwdee.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when an entity or resource is not found (HTTP 404).
 */
public class NotFoundException extends BusinessException {

    public NotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }

    public NotFoundException(String entityName, Object id) {
        super(String.format("%s with ID '%s' was not found", entityName, id), HttpStatus.NOT_FOUND);
    }
}
