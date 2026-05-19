import { splitByComma } from 'shared/lib/transformString';
import { CERTIFICATE_LABEL } from 'shared/types/certificate';
import type { CertificateType } from 'shared/types/certificate';

const ALL_CERT_TYPES = Object.keys(CERTIFICATE_LABEL) as CertificateType[];

const isCertificateType = (value: string): value is CertificateType =>
  ALL_CERT_TYPES.includes(value as CertificateType);

/** API requirements → 폼(텍스트 + 자격증) */
export function splitJobPostRequirements(requirements?: string[]) {
  const list = requirements ?? [];
  return {
    requirementsText: list.filter((r) => !isCertificateType(r)).join(', '),
    certRequirements: list.filter(isCertificateType),
  };
}

/** 폼 → API requirements (텍스트 + 자격증 enum 문자열) */
export function mergeJobPostRequirements(
  requirementsText?: string,
  certRequirements?: CertificateType[],
): string[] {
  const textParts = splitByComma(requirementsText ?? '');
  const certs = certRequirements ?? [];
  return [...textParts, ...certs];
}
