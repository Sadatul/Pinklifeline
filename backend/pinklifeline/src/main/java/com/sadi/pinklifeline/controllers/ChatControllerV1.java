package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.reqeusts.ChatMessageReq;
import com.sadi.pinklifeline.models.responses.ErrorDetails;
import com.sadi.pinklifeline.service.ChatRoomService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.support.MethodArgumentNotValidException;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDate;


@RestController
@Slf4j
public class ChatControllerV1 {
    private final SimpMessagingTemplate messagingTemplate;
    private final ChatRoomService chatRoomService;

    public ChatControllerV1(SimpMessagingTemplate messagingTemplate, ChatRoomService chatRoomService, HttpSession httpSession) {
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
        messagingTemplate.convertAndSendToUser(req.getReceiverId().toString(),
                "/queue/messages", req);
        log.debug("Message sent to {}", req.getReceiverId());
    }

    @MessageExceptionHandler(MethodArgumentNotValidException.class)
    public void handleError(MethodArgumentNotValidException e, StompHeaderAccessor accessor) {
        log.info("DUDE IT WORKED {}", e.getMessage());
        Principal user = accessor.getUser();
        if(user == null){
//            log.debug("User is null, cannot process message");
            return;
        }
        Long userId = Long.valueOf(user.getName());
        sendErrorMessage(userId, e.getMessage(), "MethodArgumentNotValidException");
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
