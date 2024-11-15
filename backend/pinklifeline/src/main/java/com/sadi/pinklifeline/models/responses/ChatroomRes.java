package com.sadi.pinklifeline.models.responses;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ChatroomRes {
    private Long roomId;
    private Long userId;
    private String name;
    private String profilePicture;

    public ChatroomRes(Long roomId, Long userId, String name) {
        this.roomId = roomId;
        this.userId = userId;
        this.name = name;
    }

    public ChatroomRes(Long roomId, Long userId, String name, String profilePicture) {
        this.roomId = roomId;
        this.userId = userId;
        this.name = name;
        this.profilePicture = profilePicture;
    }
}
