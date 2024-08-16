package com.sadi.pinklifeline.models.reqeusts;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class BlogReq {

    @NotNull
    @Size(min = 1, max = 255, message = "Title length must be within 1 to 255 chars")
    private String title;

    @NotNull
    @Size(min = 1, max = 65535, message = "Content length must be within 1 to 65535 chars")
    private String content;
}
