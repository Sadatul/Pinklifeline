package com.sadi.pinklifeline.enums;

import lombok.Getter;

@Getter
public enum SubscriptionType {
    DOCTOR_MONTHLY(1, 1, 1000),
    DOCTOR_YEARLY(2, 12, 10000),
    USER_MONTHLY(3, 1, 300),
    USER_YEARLY(4, 12, 3000),
    USER_FREE_TRIAL(5, 1, 0),
    DOCTOR_FREE_TRIAL(6, 1, 0);

    private final int value;
    private final int timeInMonths;
    private final int price;

    SubscriptionType(int value, int timeInMonths, int price) {
        this.value = value;
        this.timeInMonths = timeInMonths;
        this.price = price;
    }
}
