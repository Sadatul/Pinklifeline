package com.sadi.pinklifeline.utils;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

public class BasicUtils {
    public static Set<String> convertToLowerCaseFromListToSet(List<String> list) {
        return list.stream().map(String::toLowerCase).collect(Collectors.toSet());
    }
}
