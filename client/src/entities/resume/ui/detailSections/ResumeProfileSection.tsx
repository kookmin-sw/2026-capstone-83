import styled from 'styled-components';
import Section from 'shared/ui/Layout/Section';
import type { ResumeResponse } from '../../model/types/resume.type';
import Loading from 'shared/ui/Loading/Loading';

interface Props {
  data: ResumeResponse | null;
  actions?: React.ReactNode; // 회원정보 수정 버튼 슬롯
}

export const ResumeProfileSection = ({ data, actions }: Props) => {
  if (!data) {
    return <Loading message="프로필 정보를 불러오는 중..." />;
  }

  const { name, gender, birthDate, address, phone, email, profileUrl } = data;

  const genderLabel = gender === 'MALE' ? '남' : '여';
  const birthYear = birthDate ? new Date(birthDate).getFullYear() : '';
  const age = birthYear ? new Date().getFullYear() - Number(birthYear) : '';

  return (
    <Section>
      <S.ProfileLayout>
        <S.ProfileImage>
          <img
            src={profileUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
            alt="프로필 이미지"
          />
        </S.ProfileImage>

        <S.ProfileInfo>
          <S.NameRow>
            <S.Name>{name}</S.Name>
            <S.SubInfo>{genderLabel} {age}세 / {birthYear}년생</S.SubInfo>
            {actions && <S.ActionSlot>{actions}</S.ActionSlot>}
          </S.NameRow>

          <S.ContactList>
            <S.ContactItem>
              <span className="label">주소</span>
              <span className="value">{address}</span>
            </S.ContactItem>
            <S.ContactItem>
              <span className="label">전화번호</span>
              <span className="value">{phone}</span>
            </S.ContactItem>
            <S.ContactItem>
              <span className="label">이메일</span>
              <span className="value">{email}</span>
            </S.ContactItem>
          </S.ContactList>
        </S.ProfileInfo>
      </S.ProfileLayout>
    </Section>
  );
};

const S = {
  ProfileLayout: styled.div`
    display: flex;
    gap: 32px;
    @media (max-width: 768px) { flex-direction: column; align-items: center; }
  `,
  ProfileImage: styled.div`
    width: 160px;
    height: 180px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    overflow: hidden;
    flex-shrink: 0;
    img { width: 100%; height: 100%; object-fit: cover; }
  `,
  ProfileInfo: styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  NameRow: styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  `,
  Name: styled.h2`
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
  `,
  SubInfo: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
  `,
  ActionSlot: styled.div`
    margin-left: auto;
  `,
  ContactList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 8px;
  `,
  ContactItem: styled.div`
    display: flex;
    gap: 24px;
    font-size: ${({ theme }) => theme.fontSize.small};
    .label {
      width: 60px;
      color: ${({ theme }) => theme.color.subText};
      flex-shrink: 0;
    }
    .value {
      color: ${({ theme }) => theme.color.text};
    }
  `,
};
