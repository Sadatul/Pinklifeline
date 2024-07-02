package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.exceptions.ChatRoomNotFoundException;
import com.sadi.pinklifeline.models.entities.ChatMessage;
import com.sadi.pinklifeline.models.reqeusts.ChatMessageReq;
import com.sadi.pinklifeline.models.entities.ChatRoom;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.repositories.ChatMessageRepository;
import com.sadi.pinklifeline.repositories.ChatRoomRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserService userService;

    public ChatRoomService(ChatRoomRepository chatRoomRepository, ChatMessageRepository chatMessageRepository, UserService userService) {
        this.chatRoomRepository = chatRoomRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userService = userService;
    }

    public ChatRoom getChatRoom(Long user1Id, Long user2Id, boolean createNewRoom){
        User user1 = userService.getUserIfRegistered(user1Id);
        User user2 = userService.getUserIfRegistered(user2Id);
        Optional<ChatRoom> chatRoom = chatRoomRepository.findChatroomByUserIds(user1, user2);
        if(chatRoom.isPresent()){
            return chatRoom.get();
        }
        if(createNewRoom){
            return chatRoomRepository.save(new ChatRoom(user1, user2));
        }
        throw new ChatRoomNotFoundException(String.format("No chat was found between %d & %d", user1Id, user2Id));

    }

    public void saveMessage(ChatMessageReq req, Long senderId, Long recipientId){
        ChatRoom chatRoom = getChatRoom(senderId, recipientId, true);
        User sender = userService.getUserIfRegistered(senderId);
        ChatMessage msg = new ChatMessage(chatRoom, req.getMessage(),
                sender, req.getTimestamp(), req.getType());
        chatMessageRepository.save(msg);
    }
}
