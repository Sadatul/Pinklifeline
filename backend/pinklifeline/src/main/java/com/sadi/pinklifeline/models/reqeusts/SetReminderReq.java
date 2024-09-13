package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class SetReminderReq {
    @NotNull
    private int days;
}
