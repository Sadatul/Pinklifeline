package com.sadi.pinklifeline.exceptions;

public class OtpMismatchException extends RuntimeException{
    public OtpMismatchException(String message) {
        super(message);
    }
}
