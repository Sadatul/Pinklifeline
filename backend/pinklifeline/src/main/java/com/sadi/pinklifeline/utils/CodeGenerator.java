package com.sadi.pinklifeline.utils;

import java.security.SecureRandom;
import java.util.concurrent.ThreadLocalRandom;

public class CodeGenerator {

    // Character set including uppercase letters, digits, and special characters
    private static final String CHARACTERS = "0123456789";
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateOtp() {
        StringBuilder code = new StringBuilder(CODE_LENGTH);
        for (int i = 0; i < CODE_LENGTH; i++) {
            int index = RANDOM.nextInt(CHARACTERS.length());
            code.append(CHARACTERS.charAt(index));
        }
        return code.toString();
    }

    public static String transactionIdGenerator(){
        long timestamp = System.currentTimeMillis();
        int randomNumber = ThreadLocalRandom.current().nextInt(1000, 9999); // 4 digit random number
        return String.valueOf(timestamp) + randomNumber;
    }

}