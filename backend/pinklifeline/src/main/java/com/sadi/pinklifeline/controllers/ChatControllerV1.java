package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.reqeusts.ChatMessageReq;
import com.sadi.pinklifeline.models.responses.ChatMessageRes;
import com.sadi.pinklifeline.models.responses.ChatroomRes;
import com.sadi.pinklifeline.models.responses.ErrorDetails;
import com.sadi.pinklifeline.service.ChatRoomService;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDate;
import java.util.List;


@RestController
@Slf4j
public class ChatControllerV1 {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRoomService chatRoomService;

    public ChatControllerV1(SimpMessagingTemplate messagingTemplate, ChatRoomService chatRoomService) {
        this.messagingTemplate = messagingTemplate;
        this.chatRoomService = chatRoomService;
    }

    @MessageMapping("/chat")
    public void processMessage(@Valid @Payload ChatMessageReq req, StompHeaderAccessor accessor) {
        Principal user = accessor.getUser();
         if(user == null){
             log.debug("User is null, cannot process message");
             return;
         }
        Long userId = Long.valueOf(user.getName());
        log.debug("Request Received {} from UserID: {}", req, userId);
        chatRoomService.saveMessage(req, userId, req.getReceiverId());
        log.debug("Message Saved");
        req.setSender(userId);
        messagingTemplate.convertAndSendToUser(req.getReceiverId().toString(),
                "/queue/messages", req);
        log.debug("Message sent to {}", req.getReceiverId());
    }

    @MessageExceptionHandler(Exception.class)
    public void handleError(Exception e, StompHeaderAccessor accessor) {
        Principal user = accessor.getUser();
        if(user == null){
            return;
        }
        Long userId = Long.valueOf(user.getName());
        sendErrorMessage(userId, e.getMessage(), "Incorrect Message Payload");
    }

    @GetMapping("/v1/chat/{id}")
    @PreAuthorize("(#id.toString() == authentication.name)")
    public ResponseEntity<List<ChatroomRes>> getCharRooms(@PathVariable Long id){
        return ResponseEntity.ok(chatRoomService.getAllChatRoomsOfUser(id));
    }

    @GetMapping("/v1/chat/messages/{roomId}")
    public ResponseEntity<List<ChatMessageRes>> getChatMessages(@PathVariable Long roomId){
        List<ChatMessageRes> res = chatRoomService.getChatMessagesByRoom(roomId).stream()
                .map((message) -> new ChatMessageRes(message.getSender().getId(),
                message.getMessage(), message.getSentAt(), message.getType())).toList();
        return ResponseEntity.ok(res);
    }

    public void sendErrorMessage(Long userId, String msg, String details){
        messagingTemplate.convertAndSendToUser(userId.toString(),
                "/queue/errors", new ErrorDetails(
                        LocalDate.now(),
                        msg,
                        details
                ));
    }
}
