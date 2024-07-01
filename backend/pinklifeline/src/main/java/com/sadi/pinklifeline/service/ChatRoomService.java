package com.sadi.pinklifeline.service;

import com.sadi.pinklifeline.exceptions.ChatRoomNotFoundException;
import com.sadi.pinklifeline.models.entities.ChatMessage;
import com.sadi.pinklifeline.models.reqeusts.ChatMessageReq;
import com.sadi.pinklifeline.models.entities.ChatRoom;
import com.sadi.pinklifeline.models.entities.User;
import com.sadi.pinklifeline.repositories.ChatMessageRepository;
import com.sadi.pinklifeline.repositories.ChatRoomRepository;
import com.sadi.pinklifeline.repositories.UserRepository;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class ChatRoomService {
    private final ChatRoomRepository chatRoomRepository;
    private final UserRepository userRepository;
    private final ChatMessageRepository chatMessageRepository;

    public ChatRoomService(ChatRoomRepository chatRoomRepository, UserRepository userRepository, ChatMessageRepository chatMessageRepository) {
        this.chatRoomRepository = chatRoomRepository;
        this.userRepository = userRepository;
        this.chatMessageRepository = chatMessageRepository;
    }

    public ChatRoom getChatRoom(Long user1Id, Long user2Id, boolean createNewRoom){
        User user1 = userRepository.findById(user1Id).orElseThrow(
                () -> new UsernameNotFoundException("User not found"));
        User user2 = userRepository.findById(user2Id).orElseThrow(
                () -> new UsernameNotFoundException("User not found"));
        Optional<ChatRoom> chatRoom = chatRoomRepository.findChatroomByUserIds(user1, user2);
        if(chatRoom.isPresent()){
            return chatRoom.get();
        }
        if(createNewRoom){
            return chatRoomRepository.save(new ChatRoom(user1, user2));
        }
        throw new ChatRoomNotFoundException(String.format("No chat was found between %d & %d", user1Id, user2Id));

    }

    public ChatMessage saveMessage(ChatMessageReq req, Long senderId, Long recipientId){
        ChatRoom chatRoom = getChatRoom(senderId, recipientId, true);
        User sender = userRepository.findById(senderId).orElseThrow(
                () -> new UsernameNotFoundException("User not found"));
        ChatMessage msg = new ChatMessage(chatRoom, req.getMessage(),
                sender, req.getTimestamp(), req.getType());
//        chatRoom.addMessage(msg);
        chatMessageRepository.save(msg);
//        chatRoom.getMessages().add(msg);
//        chatRoomRepository.save(chatRoom);
        return msg;
    }
}
