package com.sadi.pinklifeline.models;

import lombok.*;


import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class ErrorDetails {
    private LocalDate timeStamp;
    private String message;
    private String details;
}
