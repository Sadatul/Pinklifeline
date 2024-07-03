package com.sadi.pinklifeline.models.reqeusts;

import com.sadi.pinklifeline.enums.MessageType;
import jakarta.validation.constraints.NotNull;
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
    @NotNull
    private Long receiverId;
    @NotNull
    private String message;
    @NotNull
    private LocalDateTime timestamp;
    @NotNull
    private MessageType type;

    public ChatMessageReq(Long receiverId,
                          String message, LocalDateTime timestamp, MessageType type) {
        this.receiverId = receiverId;
        this.message = message;
        this.timestamp = timestamp;
        this.type = type;
    }
}