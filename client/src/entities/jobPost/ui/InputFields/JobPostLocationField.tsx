
import * as S from './JobPostInputFields.styled';
import InputHeader from 'shared/ui/Input/InputHeader';
import { InputText } from 'shared/ui/Input/InputText';

interface Props {
  register: any;
  searchButtonSlot: React.ReactNode; // 버튼 슬롯 추가
  error?: string;
}

export const JobPostLocationField = ({ register, searchButtonSlot, error }: Props) => {
  return (
    <S.SectionWrapper>
      <InputHeader title="근무지" />
      <S.RowGrid $cols="3fr 1fr">
        {/* 주소 필드는 직접 타이핑하지 못하게 readOnly 처리하는 것이 좋습니다 */}
        <InputText
          placeholder="주소를 검색해주세요"
          readOnly
          {...register('location')}
          error={error}
        />
        {/* Feature에서 만든 버튼이 주입될 자리 */}
        {searchButtonSlot}
      </S.RowGrid>
    </S.SectionWrapper>
  );
};