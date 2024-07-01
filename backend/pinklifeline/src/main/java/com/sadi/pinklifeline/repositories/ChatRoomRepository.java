package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.ChatRoom;
import com.sadi.pinklifeline.models.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    @Query("select cr from ChatRoom cr where (cr.user1 = ?1 and cr.user2 = ?2) or (cr.user1 = ?2 and cr.user2 = ?1)")
    Optional<ChatRoom> findChatroomByUserIds(User user1, User user2);
}
