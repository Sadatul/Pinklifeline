package com.sadi.pinklifeline.scheduledtasks;

import com.sadi.pinklifeline.repositories.SharedReportRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class SharedReportCleanUp {

    private final SharedReportRepository sharedReportRepository;

    public SharedReportCleanUp(SharedReportRepository sharedReportRepository) {
        this.sharedReportRepository = sharedReportRepository;
    }

    @Scheduled(cron = "${shared.report.cleanup.cron}")
    public void cleanUp() {
        sharedReportRepository.deleteSharedReportIfExpired(LocalDateTime.now());
    }
}
