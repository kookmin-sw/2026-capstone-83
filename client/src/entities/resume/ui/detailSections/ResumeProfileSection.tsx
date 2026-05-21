import styled from 'styled-components';
import Section from 'shared/ui/Layout/Section';
import type { ResumeResponse } from '../../model/types/resume.type';
import Loading from 'shared/ui/Loading/Loading';

interface Props {
  data: ResumeResponse | null;
  /** 이름 옆 (좋아요 등) */
  nameActions?: React.ReactNode;
  /** 프로필 사진 아래 (고용 제안 등) */
  profileActions?: React.ReactNode;
  /** @deprecated nameActions + profileActions 사용 */
  actions?: React.ReactNode;
}

export const ResumeProfileSection = ({ data, nameActions, profileActions, actions }: Props) => {
  if (!data) {
    return <Loading message="프로필 정보를 불러오는 중..." />;
  }

  const { name, gender, phone, email } = data;
  const birthRaw = data.birthDate ?? data.birthdate;
  const address = data.address ?? data.location ?? '';
  const profileUrl = data.profileUrl ?? data.profileImageUrl;

  const genderLabel = gender === 'MALE' ? '남' : '여';
  const birthYear = birthRaw ? new Date(birthRaw).getFullYear() : '';
  const age = birthYear ? new Date().getFullYear() - Number(birthYear) + 1 : '';

  const useSplitLayout = nameActions != null || profileActions != null;

  return (
    <Section>
      <S.ProfileLayout>
        <S.ProfileColumn>
          <S.ProfileImage>
            <img
              src={profileUrl || 'https://api.dicebear.com/7.x/identicon/svg?seed=user'}
              alt="프로필 이미지"
            />
          </S.ProfileImage>
          {useSplitLayout && profileActions && (
            <S.ProfileActionSlot>{profileActions}</S.ProfileActionSlot>
          )}
        </S.ProfileColumn>

        <S.ProfileInfo>
          {useSplitLayout ? (
            <S.NameBlock>
              <S.NameLine>
                <S.Name>{name}</S.Name>
                {nameActions && <S.NameActionSlot>{nameActions}</S.NameActionSlot>}
              </S.NameLine>
              <S.SubInfo>
                {genderLabel} {age}세 / {birthYear}년생
              </S.SubInfo>
            </S.NameBlock>
          ) : (
            <S.NameRow>
              <S.Name>{name}</S.Name>
              <S.SubInfo>
                {genderLabel} {age}세 / {birthYear}년생
              </S.SubInfo>
              {actions && <S.ActionSlot>{actions}</S.ActionSlot>}
            </S.NameRow>
          )}

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
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
    }
  `,
  ProfileColumn: styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    flex-shrink: 0;
    width: 160px;

    @media (max-width: 768px) {
      width: 100%;
      max-width: 200px;
    }
  `,
  ProfileImage: styled.div`
    width: 100%;
    height: 180px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
  ProfileActionSlot: styled.div`
    margin-top: 12px;
    width: 100%;
  `,
  ProfileInfo: styled.div`
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  NameBlock: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  NameLine: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    flex-wrap: wrap;
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
    margin: 0;
  `,
  SubInfo: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
  `,
  NameActionSlot: styled.div`
    display: flex;
    align-items: center;
    flex-shrink: 0;
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
