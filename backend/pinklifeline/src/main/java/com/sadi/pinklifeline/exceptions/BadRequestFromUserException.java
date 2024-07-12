package com.sadi.pinklifeline.exceptions;

public class BadRequestFromUserException extends RuntimeException {
    public BadRequestFromUserException(String message) {
        super(message);
    }
}
