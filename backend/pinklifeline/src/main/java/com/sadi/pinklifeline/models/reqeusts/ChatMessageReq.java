package com.sadi.pinklifeline.models.reqeusts;

import com.sadi.pinklifeline.enums.MessageType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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

    private Long sender;

    @NotNull
    @Size(min = 1, max = 255)
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