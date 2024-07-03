package com.sadi.pinklifeline.models.responses;

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
public class ChatMessageRes {
    private Long sender;
    private String message;
    private LocalDateTime timestamp;
    private MessageType type;

    public ChatMessageRes(Long sender, String message, LocalDateTime timestamp, MessageType type) {
        this.sender = sender;
        this.message = message;
        this.timestamp = timestamp;
        this.type = type;
    }
}
