import styled from "styled-components";

export const SectionWrapper = styled.section`
  margin-bottom: 60px;
`;

export const FormStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-top: 20px;
`;

export const RowGrid = styled.div<{ $cols: string }>`
  display: grid;
  grid-template-columns: ${({ $cols }) => $cols};
  align-items: flex-end;
  gap: 12px;
`;

export const ImageUploadSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const UploadContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 16px;
`;

export const PreviewBox = styled.div`
  width: 200px;
  height: 140px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadow.default};
  img { width: 100%; height: 100%; object-fit: cover; }
`;

export const LabelText = styled.span`
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
`;

export const UnitText = styled.span`
  padding-bottom: 12px;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`;

export const Separator = styled.span`
  padding-bottom: 12px;
  color: ${({ theme }) => theme.color.subText};
`;

export const VerticalDivider = styled.div`
  width: 1px;
  height: 30px;
  background: ${({ theme }) => theme.color.border};
  margin: 0 10px 10px;
`;

export const SearchButton = styled.button`
  height: 45px;
  border: 1px solid ${({ theme }) => theme.color.black};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  background: white;
  cursor: pointer;
  font-weight: ${({ theme }) => theme.fontWeight.medium};
`;


export const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  /* 인풋 필드의 라벨 높이를 고려하여 하단 여백을 살짝 줍니다 */
  padding-bottom: 12px; 
  cursor: pointer;

  input[type="checkbox"] {
    width: 18px;
    height: 18px;
    cursor: pointer;
    /* 테마 컬러를 적용하고 싶다면 아래 속성 활용 */
    accent-color: ${({ theme }) => theme.color.primary}; 
  }

  label {
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    color: ${({ theme }) => theme.color.text};
    cursor: pointer;
    user-select: none;
  }
`;