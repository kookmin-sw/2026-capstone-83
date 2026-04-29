// entities/jobPost/ui/JobPostDescriptionField.tsx
import * as S from './JobPostInputFields.styled';
import { InputTextarea } from 'shared/ui/Input/InputTextarea';
import InputHeader from 'shared/ui/Input/InputHeader';
import styled from 'styled-components';

interface Props {
  register: any;
  imageActionSlot?: React.ReactNode; // 이미지 버튼 슬롯
  previewUrl?: string; // 상세 이미지 미리보기
}

export const JobPostDescriptionField = ({ register, imageActionSlot, previewUrl }: Props) => {
  return (
    <S.SectionWrapper>
      <InputHeader title="상세 정보" />

      {/* 이미지 삽입 도구 모음 영역 */}
      <ImageToolBar>
        <span className="label">이미지 삽입</span>
        {imageActionSlot}
      </ImageToolBar>

      {/* 선택된 상세 이미지가 있을 경우 미리보기 표시 */}
      {previewUrl && (
        <DescriptionImagePreview>
          <img src={previewUrl} alt="상세 설명 이미지" />
        </DescriptionImagePreview>
      )}

      <InputTextarea
        placeholder="상세 내용을 입력해주세요"
        {...register('description')}
        style={{ minHeight: '400px', marginTop: '16px' }}
      />
    </S.SectionWrapper>
  );
};

// 상세 정보 섹션 전용 추가 스타일
const ImageToolBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 20px;
  
  .label {
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
  }
`;

const DescriptionImagePreview = styled.div`
  margin-top: 16px;
  width: 100%;
  max-height: 500px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.color.border};
  
  img {
    width: 100%;
    height: 100%;
    object-fit: contain; // 상세 이미지는 잘리지 않게 표시
  }
`;