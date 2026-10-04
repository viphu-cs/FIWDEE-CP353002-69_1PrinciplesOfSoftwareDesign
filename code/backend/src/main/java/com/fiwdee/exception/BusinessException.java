package com.fiwdee.exception;

/** Base exception for domain rules that reject an operation. */
public class BusinessException extends RuntimeException {

    public BusinessException(String message) {
        super(message);
    }
}
