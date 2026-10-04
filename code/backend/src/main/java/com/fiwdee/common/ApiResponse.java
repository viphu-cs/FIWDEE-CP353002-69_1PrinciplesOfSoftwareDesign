package com.fiwdee.common;

import java.util.Map;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Consistent envelope returned by every REST endpoint.
 *
 * @param <T> type of the successful response payload
 */
@Getter
@AllArgsConstructor
public class ApiResponse<T> {

    private final boolean success;
    private final String message;
    private final T data;
    private final Map<String, String> errors;

    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, null);
    }

    public static <T> ApiResponse<T> failure(String message) {
        return new ApiResponse<>(false, message, null, null);
    }

    public static <T> ApiResponse<T> failure(String message, Map<String, String> errors) {
        return new ApiResponse<>(false, message, null, errors);
    }
}
