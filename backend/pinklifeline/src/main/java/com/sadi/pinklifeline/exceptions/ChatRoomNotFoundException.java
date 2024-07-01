package com.sadi.pinklifeline.exceptions;

public class ChatRoomNotFoundException extends RuntimeException {
    public ChatRoomNotFoundException(String msg) {
        super(msg);
    }
}
