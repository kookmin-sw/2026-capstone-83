import { useEffect } from 'react';
import type { UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import type { JobPostCreate } from '../../model/types/jobPost.type';
import * as S from './JobPostInputFields.styled';
import InputHeader from 'shared/ui/Input/InputHeader';
import { InputText } from 'shared/ui/Input/InputText';

interface Props {
  register: UseFormRegister<JobPostCreate>;
  watch: UseFormWatch<JobPostCreate>;
  setValue: UseFormSetValue<JobPostCreate>;
}

export const JobPostUrgentFields = ({ register, watch, setValue }: Props) => {
  const urgentEnabled = watch('urgentEnabled');

  useEffect(() => {
    if (!urgentEnabled) {
      setValue('urgentWageIncrease', undefined);
    }
  }, [urgentEnabled, setValue]);

  return (
    <S.SectionWrapper>
      <InputHeader title="급구 옵션" />

      <S.FormStack>
        <S.CheckboxWrapper>
          <input type="checkbox" id="urgentEnabled" {...register('urgentEnabled')} />
          <label htmlFor="urgentEnabled">급구 공고로 등록</label>
        </S.CheckboxWrapper>

        <S.HelperText>
          마감 하루 전 자정에 설정한 인상액만큼 급여가 자동으로 올라갑니다.
        </S.HelperText>

        {urgentEnabled && (
          <S.RowGrid $cols="2fr auto">
            <InputText
              label="급여 인상액"
              placeholder="0"
              type="number"
              min={1}
              {...register('urgentWageIncrease', {
                valueAsNumber: true,
                required: '급여 인상액을 입력해주세요.',
                min: { value: 1, message: '1원 이상 입력해주세요.' },
              })}
            />
            <S.UnitText>원</S.UnitText>
          </S.RowGrid>
        )}
      </S.FormStack>
    </S.SectionWrapper>
  );
};
