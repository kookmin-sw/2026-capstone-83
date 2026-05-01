import * as S from './JobPostInputFields.styled';
import InputHeader from 'shared/ui/Input/InputHeader';
import { InputText } from 'shared/ui/Input/InputText';
import { InputSelect } from 'shared/ui/Input/InputSelect';

interface Props {
  register: any;
  errors: any;
  previewUrl?: string; // 미리보기 이미지 주소
  imageActionSlot?: React.ReactNode; // 버튼들이 들어올 슬롯
}

export const JobPostBasicInfoFields = ({ register, errors, previewUrl, imageActionSlot }: Props) => {
  return (
    <S.SectionWrapper>
      <InputHeader title="공고 기본 정보" />

      <S.FormStack>
        <InputText
          label="공고 제목"
          placeholder="제목을 입력해주세요"
          {...register('title')}
          error={errors.title?.message}
        />

        {/* 이미지 업로드 섹션: UI 뼈대만 유지 */}
        <S.ImageUploadSection>
          <S.LabelText>공고 이미지</S.LabelText>
          <S.UploadContainer>
            <S.PreviewBox>
              {/* previewUrl이 없으면 플레이스홀더 표시 */}
              <img src={previewUrl || "https://via.placeholder.com/400x320?text=No+Image"} alt="미리보기" />
            </S.PreviewBox>

            {/* 이 자리에 Feature에서 만든 버튼들이 주입됩니다 */}
            {imageActionSlot}
          </S.UploadContainer>
        </S.ImageUploadSection>

        {/* ... 급여, 마감일 등 나머지 필드는 동일 ... */}
        <S.RowGrid $cols="1fr 2fr auto">
          <InputSelect
            label="급여"
            options={[{ label: '일급', value: 'DAILY' }, { label: '시급', value: 'HOURLY' }]}
            {...register('wageType')}
          />
          <InputText placeholder="0" type="number" {...register('wage')} />
          <S.UnitText>원</S.UnitText>
        </S.RowGrid>

        {/* 공고 마감 및 상시 모집 */}
        <S.RowGrid $cols="2fr auto">
          <InputText
            label="공고 마감"
            type="date"
            {...register('deadline')}
          />
          <S.CheckboxWrapper>
            <input type="checkbox" id="always" />
            <label htmlFor="always">상시 모집</label>
          </S.CheckboxWrapper>
        </S.RowGrid>

        {/* 근무 일시 (날짜 및 시간 범위) */}
        <S.RowGrid $cols="1fr auto 1fr auto 1fr auto 1fr">
          <InputText label="근무 일시" type="date" {...register('workDate')} />
          <S.VerticalDivider />
          <InputText type="time" {...register('workStart')} />
          <S.Separator>~</S.Separator>
          <InputText type="time" {...register('workEnd')} />
        </S.RowGrid>

        {/* 모집 인원 */}
        <S.RowGrid $cols="2fr auto">
          <InputText
            label="모집 인원"
            placeholder="0"
            type="number"
            {...register('totalSlots')}
          />
          <S.UnitText>명</S.UnitText>
        </S.RowGrid>
      </S.FormStack>
    </S.SectionWrapper>
  );
};