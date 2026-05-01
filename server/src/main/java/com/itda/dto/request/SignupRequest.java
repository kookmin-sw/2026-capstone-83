package com.itda.dto.request;

public record SignupRequest(
        String role,
        String name,
        String birth,
        String email,
        String password,
        Integer gender,
        String phone,
        String location,
        String businessNumber
) {}
