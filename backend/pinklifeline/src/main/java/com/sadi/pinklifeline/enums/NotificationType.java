package com.sadi.pinklifeline.enums;

import lombok.Getter;

@Getter
public enum NotificationType {
    PERIOD_START(0),
    SELF_TEST(1);

    private final int val;

    NotificationType(int val) {
        this.val = val;
    }
}
