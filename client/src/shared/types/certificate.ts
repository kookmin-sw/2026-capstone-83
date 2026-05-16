/** 자격/인증 종류 (서버 CertificateType enum 매핑) */
export type CertificateType =
  | 'HEALTH_CERTIFICATE'   // 보건증
  | 'DRIVER_LICENSE'       // 운전면허
  | 'OWN_CAR'              // 자차 보유
  | 'ID_CARD'              // 신분증
  | 'BANK_ACCOUNT_COPY'    // 통장사본
  | 'RESUME_REQUIRED'      // 이력서
  | 'CRIMINAL_RECORD'      // 범죄조회
  | 'ALIEN_REGISTRATION';  // 외국인등록증

/** 자격/인증 응답 (이력서 조회 시 포함) */
export interface CertificateResponse {
  id: number;
  type: CertificateType;
  imageUrl?: string;
}

/** 자격/인증 UI 표시용 라벨 맵 */
export const CERTIFICATE_LABEL: Record<CertificateType, string> = {
  HEALTH_CERTIFICATE: '보건증',
  DRIVER_LICENSE: '운전면허',
  OWN_CAR: '자차 보유',
  ID_CARD: '신분증',
  BANK_ACCOUNT_COPY: '통장사본',
  RESUME_REQUIRED: '이력서',
  CRIMINAL_RECORD: '범죄조회',
  ALIEN_REGISTRATION: '외국인등록증',
};
