package com.sadi.pinklifeline.models.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chat_rooms")
@NoArgsConstructor
@Getter
@Setter
@ToString
public class ChatRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @OneToMany(mappedBy = "room")
    @ToString.Exclude
    private List<ChatMessage> messages;

    public ChatRoom(User user1, User user2) {
        this.user1 = user1;
        this.user2 = user2;
        messages = new ArrayList<>();
    }

    public void addMessage(ChatMessage message) {
        messages.add(message);
    }
}