package com.sadi.pinklifeline.exceptions;

public class OtpTimedOutException extends RuntimeException{
    public OtpTimedOutException(String message) {
        super(message);
    }
}
