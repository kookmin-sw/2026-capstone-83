import styled from 'styled-components';
import Section from 'shared/ui/Layout/Section';
import type { Workplace } from '../model/types/workplace.type';

interface Props {
  data: Workplace;
  actions?: React.ReactNode; // 수정 버튼 슬롯
}

export const WorkplaceInfoSection = ({ data, actions }: Props) => {
  const { name, companyName, address, businessNumber, companyLogoUrl } = data;

  return (
    <Section title={name} action={actions}>
      <S.InfoLayout>
        <S.ImageWrapper>
          <img src={companyLogoUrl || 'https://picsum.photos/400/300'} alt={`${name} 이미지`} />
        </S.ImageWrapper>

        <S.InfoContent>
          <S.InfoTitle>{companyName}</S.InfoTitle>
          <S.InfoText>{address}</S.InfoText>
          <S.InfoText>{businessNumber}</S.InfoText>
        </S.InfoContent>
      </S.InfoLayout>
    </Section>
  );
};

const S = {
  InfoLayout: styled.div`
    display: flex;
    gap: 24px;
    @media (max-width: 768px) { flex-direction: column; }
  `,
  ImageWrapper: styled.div`
    width: 200px;
    height: 140px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    overflow: hidden;
    flex-shrink: 0;
    img { width: 100%; height: 100%; object-fit: cover; }

    @media (max-width: 768px) {
      width: 100%;
      height: 180px;
    }
  `,
  InfoContent: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    justify-content: center;
  `,
  InfoTitle: styled.h3`
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
  `,
  InfoText: styled.p`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    line-height: 1.5;
  `,
};
