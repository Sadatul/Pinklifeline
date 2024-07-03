package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.ChatMessage;
import com.sadi.pinklifeline.models.entities.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomOrderBySentAt(ChatRoom room);
}
