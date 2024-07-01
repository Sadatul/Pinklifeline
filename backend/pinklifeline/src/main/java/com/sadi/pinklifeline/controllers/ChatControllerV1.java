package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.reqeusts.ChatMessageReq;
import com.sadi.pinklifeline.service.ChatRoomService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RestController;


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
    public void processMessage(@Payload ChatMessageReq req) {
        log.info("Request Received: {}", req.toString());
        chatRoomService.saveMessage(req, req.getSenderId(), req.getReceiverId());
        log.info("Message Saved");
        messagingTemplate.convertAndSendToUser(req.getReceiverId().toString(), "/queue/messages", req);
        log.info("Message sent to queue");
    }
}
