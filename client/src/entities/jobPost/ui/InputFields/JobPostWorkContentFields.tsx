import InputHeader from "shared/ui/Input/InputHeader";
import { FormStack, SectionWrapper } from "./JobPostInputFields.styled";
import { InputText } from "shared/ui/Input/InputText";
import { CheckboxButtons } from "shared/ui/Input/CheckboxButtons";
import { CERTIFICATE_LABEL } from "shared/types/certificate";
import type { CertificateType } from "shared/types/certificate";

const CERTIFICATE_OPTIONS = (Object.keys(CERTIFICATE_LABEL) as CertificateType[]).map((key) => ({
  label: CERTIFICATE_LABEL[key],
  value: key,
}));

export const JobPostWorkContentFields = ({ register, setValue, watch }: any) => {
  const selectedCerts: string[] = watch?.('requirements') || [];

  const handleCertToggle = (value: string) => {
    const current = selectedCerts.includes(value)
      ? selectedCerts.filter((v: string) => v !== value)
      : [...selectedCerts, value];
    setValue?.('requirements', current);
  };

  return (
    <SectionWrapper>
      <InputHeader title="근무 내용" />
      <FormStack>
        <InputText label="지원 조건 (텍스트)" placeholder="예: 학력 무관, 경력 1년 이상" {...register('requirementsText')} />

        {/* 필수 자격/인증 선택 */}
        {setValue && (
          <CheckboxButtons
            multiple
            label="필수 자격/인증"
            options={CERTIFICATE_OPTIONS}
            selected={selectedCerts}
            onToggle={handleCertToggle}
            buttonSize="xsmall"
          />
        )}

        <InputText label="우대 조건" placeholder="예: 인근 거주자, 자차 보유자" {...register('benefits')} />
        <InputText label="업무 내용" placeholder="예: 자재 하차 및 정리" {...register('tasks')} />
        <InputText label="준비물" placeholder="예: 작업복, 안전화" {...register('items')} />
      </FormStack>
    </SectionWrapper>
  );
};