package com.itda.dto.request;

public record SignupRequest(
        String role,
        String name,
        String birth,
        String email,
        String password,
        String gender,
        String phone,
        String location,
        String businessNumber
) {}
