package com.sadi.pinklifeline.controllers;

import com.sadi.pinklifeline.models.reqeusts.SetReminderReq;
import com.sadi.pinklifeline.service.SelfTestReminderHandlerService;
import com.sadi.pinklifeline.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;


@Slf4j
@RestController
@RequestMapping("/v1/self-test/reminder")
@RequiredArgsConstructor
public class SelfTestReminderHandlerV1 {
    private final SelfTestReminderHandlerService reminderHandlerService;

    @PutMapping
    public ResponseEntity<Void> reactToReminder(@Valid @RequestBody SetReminderReq req){
        if(req.getDays() < 0)
            reminderHandlerService.pingForPeriodStart();
        else{
            reminderHandlerService.setSelfTestReminder(req);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping
    public ResponseEntity<Void> setNewReminder(
            @RequestParam(required = false, defaultValue = "false") Boolean deletePrevious
    ){
        Long userId = SecurityUtils.getOwnerID();
        List<Object> data = reminderHandlerService.getPeriodData(userId);
        reminderHandlerService.setNewReminder((LocalDate)data.getFirst(), (Integer) data.get(1),
                userId, deletePrevious);
        return ResponseEntity.ok().build();
    }
}
