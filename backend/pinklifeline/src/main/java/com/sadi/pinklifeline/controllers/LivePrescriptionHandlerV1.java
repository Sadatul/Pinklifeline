package com.sadi.pinklifeline.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.sadi.pinklifeline.exceptions.InternalServerErrorException;
import com.sadi.pinklifeline.models.dtos.LivePrescription;
import com.sadi.pinklifeline.models.reqeusts.LivePrescriptionReq;
import com.sadi.pinklifeline.models.responses.ErrorDetails;
import com.sadi.pinklifeline.repositories.LivePrescriptionRepository;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;
import java.time.LocalDate;

@RestController
@Slf4j
public class LivePrescriptionHandlerV1 {
    private final SimpMessagingTemplate messagingTemplate;
    private final LivePrescriptionRepository livePrescriptionRepository;

    public LivePrescriptionHandlerV1(SimpMessagingTemplate messagingTemplate, LivePrescriptionRepository livePrescriptionRepository) {
        this.messagingTemplate = messagingTemplate;
        this.livePrescriptionRepository = livePrescriptionRepository;
    }

    @MessageMapping("/live-prescription")
    public void processMessage(@Valid @Payload LivePrescriptionReq req, StompHeaderAccessor accessor) {
        Principal user = accessor.getUser();
        if(user == null){
            log.debug("User is null, cannot process message");
            return;
        }
        Long userId = Long.valueOf(user.getName());
        log.debug("Request Received {} from UserID: {}", req, userId);
        try {
            livePrescriptionRepository.putLivePrescription(
                    new LivePrescription(req.getAnalysis(), req.getMedications(), req.getTests()),
                    req.getCallId()
            );
        } catch (JsonProcessingException e) {
            throw new InternalServerErrorException("Sorry unable to process Request");
        }
        messagingTemplate.convertAndSendToUser(req.getReceiverId().toString(),
                "/queue/live-prescription", req);
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

    public void sendErrorMessage(Long userId, String msg, String details){
        messagingTemplate.convertAndSendToUser(userId.toString(),
                "/queue/live-prescription/errors", new ErrorDetails(
                        LocalDate.now(),
                        msg,
                        details
                ));
    }
}
