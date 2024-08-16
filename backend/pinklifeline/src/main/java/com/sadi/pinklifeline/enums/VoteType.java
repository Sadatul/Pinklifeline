package com.sadi.pinklifeline.enums;

import lombok.Getter;

@Getter
public enum VoteType {
    UPVOTE(1),
    DOWNVOTE(-1),
    UNVOTE(0);

    private final int value;

    VoteType(int value) {
        this.value = value;
    }

}
