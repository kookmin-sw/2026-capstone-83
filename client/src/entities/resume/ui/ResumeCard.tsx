import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import type { ResumeResponse } from '../model/types/resume.type';
import { MapPin } from 'lucide-react';

interface Props {
  data: ResumeResponse;
}

export const ResumeCard = ({ data }: Props) => {
  const navigate = useNavigate();
  const { id, name, gender, birthDate, address, profileUrl, totalHired, careers } = data;

  const genderLabel = gender === 'MALE' ? '남' : '여';
  const birthYear = birthDate ? new Date(birthDate).getFullYear() : 0;
  const age = birthYear ? new Date().getFullYear() - birthYear : '';

  // 대표 경력 (첫 번째 + 기간)
  const mainCareer = careers && careers.length > 0 ? careers[0] : null;
  const formatDuration = (years: number, months: number) => {
    const parts = [];
    if (years > 0) parts.push(`${years}년`);
    if (months > 0) parts.push(`${months}개월`);
    return parts.join(' ') || '0개월';
  };

  return (
    <CardWrapper onClick={() => navigate(`/resume/${id}`)}>
      <ProfileImage>
        <img
          src={profileUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=default'}
          alt={`${name} 프로필`}
        />
      </ProfileImage>

      <CardContent>
        <NameRow>
          <Name>{name}({genderLabel}, {age}세)</Name>
        </NameRow>

        {mainCareer && (
          <CareerText>
            {mainCareer.jobTitle} ({formatDuration(mainCareer.years, mainCareer.months)})
          </CareerText>
        )}

        <MetaRow>
          <MetaItem>
            <MapPin size={12} />
            {address}
          </MetaItem>
          <MetaDivider>|</MetaDivider>
          <MetaItem>누적 {totalHired}건</MetaItem>
        </MetaRow>
      </CardContent>
    </CardWrapper>
  );
};

const CardWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background-color: ${({ theme }) => theme.color.white};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  box-shadow: ${({ theme }) => theme.shadow.default};
  cursor: pointer;
  transition: transform 0.15s ease;

  &:hover {
    transform: translateY(-2px);
  }
`;

const ProfileImage = styled.div`
  width: 72px;
  height: 72px;
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  flex-shrink: 0;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const NameRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Name = styled.span`
  font-size: ${({ theme }) => theme.fontSize.medium};
  font-weight: ${({ theme }) => theme.fontWeight.semibold};
`;

const CareerText = styled.span`
  font-size: ${({ theme }) => theme.fontSize.small};
  color: ${({ theme }) => theme.color.subText};
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
`;

const MetaItem = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: ${({ theme }) => theme.fontSize.xsmall};
  color: ${({ theme }) => theme.color.subText};
`;

const MetaDivider = styled.span`
  color: ${({ theme }) => theme.color.border};
  font-size: ${({ theme }) => theme.fontSize.xsmall};
`;
