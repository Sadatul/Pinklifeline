package com.sadi.pinklifeline.models.reqeusts;

import com.sadi.pinklifeline.utils.BasicUtils;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@ToString
public class ForumQuestionReq {
    @NotNull
    @Size(min = 1, max = 255, message = "Title length must be within 1 to 255 chars")
    private String title;

    @NotNull
    @Size(min = 1, max = 65535, message = "Content length must be within 1 to 65535 chars")
    private String body;

    @NotNull
    private List<String> tags;

    @AssertTrue(message = "Can't consist of duplicate tags")
    public boolean isDuplicate() {
        Set<String> set = BasicUtils.convertToLowerCaseFromListToSet(tags);
        return set.size() == tags.size();
    }
}
