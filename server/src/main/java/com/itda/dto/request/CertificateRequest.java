package com.itda.dto.request;

import com.itda.enums.CertificateType;
import lombok.Getter;

@Getter
public class CertificateRequest {

    // 자격/인증 종류
    private CertificateType type;
}