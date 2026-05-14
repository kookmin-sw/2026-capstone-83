package com.itda.dto.response;

import com.itda.entity.Certificate;
import com.itda.enums.CertificateType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CertificateResponse {

    private Long id;
    private CertificateType type;
    private String imageUrl;

    public static CertificateResponse from(Certificate certificate) {
        return CertificateResponse.builder()
                .id(certificate.getId())
                .type(certificate.getType())
                .imageUrl(certificate.getImageUrl())
                .build();
    }
}