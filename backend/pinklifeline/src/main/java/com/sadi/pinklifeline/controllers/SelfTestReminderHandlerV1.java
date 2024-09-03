package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.reqeusts.SetReminderReq;
import com.sadi.pinklifeline.service.SelfTestReminderHandlerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@Slf4j
@RestController
@RequestMapping("/v1/self-test/reminder")
@RequiredArgsConstructor
public class SelfTestReminderHandlerV1 {
    private final SelfTestReminderHandlerService reminderHandlerService;

    @PutMapping
    public ResponseEntity<Void> setReminder(@Valid @RequestBody SetReminderReq req){
        if(req.getDays() < 0)
            reminderHandlerService.pingForPeriodStart();
        else{
            reminderHandlerService.setSelfTestReminder(req);
        }
        return ResponseEntity.ok().build();
    }
}
