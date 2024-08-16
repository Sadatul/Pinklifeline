package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ForumAnswerReq {
    @NotNull
    private Long questionId;

    private Long parentId;

    @NotNull
    @Size(min = 1, max = 65535, message = "Content length must be within 1 to 65535 chars")
    private String body;
}
