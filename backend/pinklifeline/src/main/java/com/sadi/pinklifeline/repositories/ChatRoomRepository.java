package com.sadi.pinklifeline.repositories;

import com.sadi.pinklifeline.models.entities.ChatRoom;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.models.responses.ChatroomRes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChatRoomRepository extends JpaRepository<ChatRoom, Long> {
    @Query("select cr from ChatRoom cr where (cr.user1 = ?1 and cr.user2 = ?2) " +
            "or (cr.user1 = ?2 and cr.user2 = ?1)")
    Optional<ChatRoom> findChatroomByUserIds(User user1, User user2);

    @Query("select new com.sadi.pinklifeline.models.responses.ChatroomRes(cr.id, u.id, u.fullName, u.profilePicture) from ChatRoom cr join User u on (u.id = case when cr.user1.id = :id then cr.user2.id else cr.user1.id end) left join ChatMessage cm on cr.id = cm.room.id where (cr.user1.id = :id or cr.user2.id = :id) group by cr.id, u.id, u.fullName, u.profilePicture order by max(cm.sentAt) desc")
    List<ChatroomRes> findChatRooms(Long id);

}
