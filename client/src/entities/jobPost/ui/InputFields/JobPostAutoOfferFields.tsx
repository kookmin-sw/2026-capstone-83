import type { UseFormRegister, UseFormWatch } from 'react-hook-form';
import type { JobPostCreate } from '../../model/types/jobPost.type';
import { AutoOfferTargetPicker } from 'features/offer/AutoOfferTargetPicker';
import * as S from './JobPostInputFields.styled';
import InputHeader from 'shared/ui/Input/InputHeader';

interface Props {
  register: UseFormRegister<JobPostCreate>;
  watch: UseFormWatch<JobPostCreate>;
  selectedOfferUserIds: Set<number>;
  onSelectedOfferUserIdsChange: (next: Set<number>) => void;
}

export const JobPostAutoOfferFields = ({
  register,
  watch,
  selectedOfferUserIds,
  onSelectedOfferUserIdsChange,
}: Props) => {
  const autoOfferEnabled = watch('autoOfferEnabled');

  return (
    <S.SectionWrapper>
      <InputHeader title="채용 제안 대상 선택" />

      <S.FormStack>
        <S.CheckboxWrapper>
          <input type="checkbox" id="autoOfferEnabled" {...register('autoOfferEnabled')} />
          <label htmlFor="autoOfferEnabled">공고 등록 후 선택한 구직자에게 채용 제안 보내기</label>
        </S.CheckboxWrapper>

        <S.HelperText>
          체크하면 좋아요·장기근무 목록이 표시됩니다. 제안을 보낼 구직자를 선택한 뒤 공고를
          등록하세요.
        </S.HelperText>

        <AutoOfferTargetPicker
          enabled={!!autoOfferEnabled}
          selectedUserIds={selectedOfferUserIds}
          onChange={onSelectedOfferUserIdsChange}
        />

        {!!autoOfferEnabled && (
          <>
            <S.CheckboxWrapper>
              <input type="checkbox" id="offerInstantHire" {...register('offerInstantHire')} />
              <label htmlFor="offerInstantHire">
                구직자가 승인하면 즉시 채용되게 하시겠습니까?
              </label>
            </S.CheckboxWrapper>
            <S.HelperText>
              체크하면 제안 수락 시 바로 채용이 확정되고, 해제하면 고용주 최종 확정 단계를 거칩니다.
            </S.HelperText>
          </>
        )}
      </S.FormStack>
    </S.SectionWrapper>
  );
};
