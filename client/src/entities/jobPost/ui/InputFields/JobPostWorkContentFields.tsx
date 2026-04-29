import InputHeader from "shared/ui/Input/InputHeader";
import { FormStack, SectionWrapper } from "./JobPostInputFields.styled";
import { InputText } from "shared/ui/Input/InputText";

export const JobPostWorkContentFields = ({ register }: any) => {
  return (
    <SectionWrapper>
      <InputHeader title="근무 내용" />
      <FormStack>
        <InputText label="지원 조건" placeholder="예: 학력 무관, 경력 1년 이상" {...register('requirements')} />
        <InputText label="우대 조건" placeholder="예: 인근 거주자, 자차 보유자" {...register('benefits')} />
        <InputText label="업무 내용" placeholder="예: 자재 하차 및 정리" {...register('tasks')} />
        <InputText label="준비물" placeholder="예: 작업복, 안전화" {...register('items')} />
      </FormStack>
    </SectionWrapper>
  );
};