package com.itda.dto.request;

import com.itda.enums.Gender;

public record SignupRequest(
    String role,
    String name,
    String birth,
    String email,
    String password,
    Gender gender,
    String phone,
    String location,
    String businessNumber) {
}
