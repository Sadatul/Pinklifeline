package com.sadi.pinklifeline.exceptions;

public class UserRegistrationAlreadyCompleteException extends RuntimeException {
    public UserRegistrationAlreadyCompleteException(String msg) {
        super(msg);
    }
}
