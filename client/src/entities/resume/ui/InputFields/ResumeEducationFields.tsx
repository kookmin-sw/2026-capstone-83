import type { UseFormRegister } from 'react-hook-form';
import type { ResumeRequest } from '../../model/types/resume.type';
import { InputSelect, type SelectOption } from 'shared/ui/Input/InputSelect';
import { InputText } from 'shared/ui/Input/InputText';
import styled from 'styled-components';
import InputHeader from 'shared/ui/Input/InputHeader';

interface Props {
  register: UseFormRegister<ResumeRequest>;
}

const EDUCATION_OPTIONS: SelectOption[] = [
  { label: '고등학교', value: 'HIGH' },
  { label: '대학(2,3년제)', value: 'COLLEGE' },
  { label: '대학(4년제)', value: 'UNIVERSITY' },
  { label: '대학원', value: 'GRADUATE' },
];

const STATUS_OPTIONS: SelectOption[] = [
  { label: '졸업', value: 'GRADUATED' },
  { label: '재학중', value: 'ENROLLED' },
  { label: '졸업예정', value: 'EXPECTED' },
  { label: '휴학중', value: 'LEAVE' },
  { label: '중퇴', value: 'DROPPED' },
];

export const ResumeEducationFields = ({ register }: Props) => {
  return (
    <div>
      <InputHeader title="학력" titleSize="medium" />
      <S.FieldRow>
        <InputSelect
          label="학력"
          labelSize="xsmall"
          options={EDUCATION_OPTIONS}
          placeholder="선택"
          {...register('education')}
        />
        <InputSelect
          label="학적 상태"
          labelSize="xsmall"
          options={STATUS_OPTIONS}
          placeholder="선택"
          {...register('educationStatus')}
        />
        <InputText
          label="전공"
          labelSize="xsmall"
          placeholder="전공을 입력해주세요"
          {...register('major')}
        />
      </S.FieldRow>
    </div>
  );
};

const S = {
  FieldRow: styled.div`
    display: flex;
    gap: 16px;
    margin-top: 16px;
    flex-wrap: wrap;

    & > * {
      flex: 1;
      min-width: 150px;
    }
  `,
};
