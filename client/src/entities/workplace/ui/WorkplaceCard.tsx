import styled from 'styled-components';
import type { Workplace } from '../model/types/workplace.type';
import { hoverOverlay } from 'shared/styles/hoverOverlay';

interface Props {
  data: Workplace;
  isActive: boolean;
  onClick: () => void;
  actions?: React.ReactNode; // 수정/삭제 버튼 슬롯
}

export const WorkplaceCard = ({ data, isActive, onClick, actions }: Props) => {
  const { name, companyName, address, businessNumber, companyLogoUrl } = data;

  return (
    <S.Wrapper>
      <S.Card $active={isActive} onClick={onClick}>
        <S.CardImage>
          <img src={companyLogoUrl || 'https://picsum.photos/400/300'} alt={companyName} />
        </S.CardImage>
        <S.CardInfo>
          <S.CardTitle>{name}</S.CardTitle>
          <S.CardText>{companyName}</S.CardText>
          <S.CardText>{address}</S.CardText>
          <S.CardText>{businessNumber}</S.CardText>
        </S.CardInfo>
      </S.Card>

      {actions && <S.CardActions>{actions}</S.CardActions>}
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    display: flex;
    align-items: stretch;
    gap: 12px;

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      gap: 10px;
    }

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      gap: 8px;
    }

    @media (${({ theme }) => theme.mediaQuery.mobile}) {
      flex-direction: column;
      gap: 8px;
    }
  `,
  Card: styled.div<{ $active: boolean }>`
    display: flex;
    align-items: stretch;
    flex: 1;
    padding: 20px 24px;
    gap: 20px;
    background-color: ${({ theme, $active }) =>
      $active ? theme.color.secondary : theme.color.white};
    border: 1px solid ${({ theme, $active }) =>
      $active ? theme.color.primary : theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
    cursor: pointer;
    transition: all 0.15s ease;

    ${hoverOverlay}

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      padding: 16px 20px;
      gap: 16px;
    }

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      padding: 14px 16px;
      gap: 12px;
    }

    @media (${({ theme }) => theme.mediaQuery.mobile}) {
      padding: 12px;
      gap: 10px;
      flex-direction: column;
    }
  `,
  CardImage: styled.div`
    width: 240px;
    height: 150px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    overflow: hidden;
    flex-shrink: 0;
    img { width: 100%; height: 100%; object-fit: cover; }

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      width: 200px;
      height: 125px;
    }

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      width: 160px;
      height: 100px;
    }

    @media (${({ theme }) => theme.mediaQuery.mobile}) {
      width: 100%;
      height: 160px;
    }
  `,
  CardInfo: styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
  `,
  CardTitle: styled.h3`
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    margin-bottom: 12px;

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      font-size: 1.25rem;
      margin-bottom: 10px;
    }

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      font-size: ${({ theme }) => theme.fontSize.medium};
      margin-bottom: 8px;
    }

    @media (${({ theme }) => theme.mediaQuery.mobile}) {
      font-size: ${({ theme }) => theme.fontSize.medium};
      margin-bottom: 6px;
    }
  `,
  CardText: styled.p`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    line-height: 1.5;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      font-size: ${({ theme }) => theme.fontSize.xsmall};
    }
  `,
  CardActions: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;

    @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
      gap: 6px;
    }

    @media (${({ theme }) => theme.mediaQuery.mobile}) {
      flex-direction: row;
      justify-content: flex-end;
    }
  `,
};
