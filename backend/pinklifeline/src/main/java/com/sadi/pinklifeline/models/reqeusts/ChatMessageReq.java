package com.sadi.pinklifeline.models.reqeusts;

import com.sadi.pinklifeline.enums.MessageType;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ChatMessageReq {
    private Long senderId;
    private Long receiverId;
    private String message;
    private LocalDateTime timestamp;
    private MessageType type;

    public ChatMessageReq(Long senderId, Long receiverId,
                          String message, LocalDateTime timestamp, MessageType type) {
        this.senderId = senderId;
        this.receiverId = receiverId;
        this.message = message;
        this.timestamp = timestamp;
        this.type = type;
    }
}