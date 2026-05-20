import React from 'react';
import styled from 'styled-components';
import { MapPin, Briefcase } from 'lucide-react';
import type { ApplicantResponse } from '../model/types/application.type';

interface Props {
  data: ApplicantResponse;
  actions?: React.ReactNode;
  reviewSlot?: React.ReactNode;
  onClick?: () => void;
}

export const ApplicantCard = ({ data, actions, reviewSlot, onClick }: Props) => {
  const { name, profileImageUrl, gender, age, location, matchCount, appliedAt } = data;
  const genderLabel = gender === 'MALE' ? '남' : '여';

  return (
    <S.Card onClick={onClick}>
      <S.ProfileImage>
        <img
          src={profileImageUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=default'}
          alt={`${name} 프로필`}
        />
      </S.ProfileImage>

      <S.Content>
        <S.NameRow>
          <S.Name>{name} ({genderLabel}, {age}세)</S.Name>
          {actions}
        </S.NameRow>

        <S.MetaRow>
          <S.MetaItem>
            <MapPin size={12} />
            {location}
          </S.MetaItem>
          <S.MetaDivider>|</S.MetaDivider>
          <S.MetaItem>
            <Briefcase size={12} />
            매칭 {matchCount}건
          </S.MetaItem>
        </S.MetaRow>

        <S.AppliedDate>지원일: {appliedAt}</S.AppliedDate>

        {/* 리뷰 슬롯 — 카드 클릭(이력서 모달)과 분리 */}
        {reviewSlot && (
          <S.ReviewSlot onClick={(e) => e.stopPropagation()}>
            {reviewSlot}
          </S.ReviewSlot>
        )}
      </S.Content>
    </S.Card>
  );
};

const S = {
  Card: styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 16px 20px;
    background-color: ${({ theme }) => theme.color.white};
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    transition: transform 0.15s ease;

    &:hover {
      transform: translateY(-1px);
      box-shadow: ${({ theme }) => theme.shadow.default};
    }
  `,
  ProfileImage: styled.div`
    width: 56px;
    height: 56px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    overflow: hidden;
    flex-shrink: 0;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
  Content: styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  `,
  NameRow: styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
  `,
  Name: styled.span`
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
  `,
  MetaRow: styled.div`
    display: flex;
    align-items: center;
    gap: 6px;
  `,
  MetaItem: styled.span`
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
  MetaDivider: styled.span`
    color: ${({ theme }) => theme.color.border};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
  `,
  AppliedDate: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.thirdText};
  `,
  ReviewSlot: styled.div`
    width: 100%;
  `,
};
