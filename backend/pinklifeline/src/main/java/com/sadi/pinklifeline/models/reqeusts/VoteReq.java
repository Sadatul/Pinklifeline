package com.sadi.pinklifeline.models.reqeusts;

import com.sadi.pinklifeline.enums.VoteType;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class VoteReq {

    @NotNull
    private VoteType voteType;
}
