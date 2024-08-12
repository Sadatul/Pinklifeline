package com.sadi.pinklifeline;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class PinklifelineApplication {

    public static void main(String[] args) {
        SpringApplication.run(PinklifelineApplication.class, args);
    }

}
