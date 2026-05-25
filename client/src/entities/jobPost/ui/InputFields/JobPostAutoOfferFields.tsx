import type { UseFormRegister } from 'react-hook-form';
import type { JobPostCreate } from '../../model/types/jobPost.type';
import * as S from './JobPostInputFields.styled';
import InputHeader from 'shared/ui/Input/InputHeader';

interface Props {
  register: UseFormRegister<JobPostCreate>;
}

export const JobPostAutoOfferFields = ({ register }: Props) => (
  <S.SectionWrapper>
    <InputHeader title="자동 채용 제안" />

    <S.FormStack>
      <S.CheckboxWrapper>
        <input type="checkbox" id="autoOfferEnabled" {...register('autoOfferEnabled')} />
        <label htmlFor="autoOfferEnabled">공고 등록 시 우선 대상에게 자동 제안</label>
      </S.CheckboxWrapper>

      <S.HelperText>
        체크 시 저장 직후 장기근무자·관심 인재 등 우선 대상에게 일괄 채용 제안이 발송됩니다.
        대상이 없으면 제안은 보내지 않습니다.
      </S.HelperText>
    </S.FormStack>
  </S.SectionWrapper>
);
