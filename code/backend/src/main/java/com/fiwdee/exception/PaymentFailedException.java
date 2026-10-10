package com.fiwdee.exception;

public class PaymentFailedException extends ValidationException{
    public PaymentFailedException(String message) {
        super(message);
    }
}
