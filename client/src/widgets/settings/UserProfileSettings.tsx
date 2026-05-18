import styled from 'styled-components';
import { UserProfileForm } from 'features/user-profile/UserProfileForm';
import { PasswordChangeForm } from 'features/user-profile/PasswordChangeForm';
import Section from 'shared/ui/Layout/Section';

export const UserProfileSettings = () => {
  return (
    <S.PageWrapper>
      <S.PageHeader>
        <S.PageTitle>설정</S.PageTitle>
        <S.PageDescription>회원정보와 계정 보안을 관리할 수 있습니다.</S.PageDescription>
      </S.PageHeader>

      <Section title="회원정보">
        <UserProfileForm />
      </Section>

      <Section title="비밀번호 변경">
        <S.SectionDesc>소셜 로그인 계정은 비밀번호 변경이 지원되지 않을 수 있습니다.</S.SectionDesc>
        <PasswordChangeForm />
      </Section>
    </S.PageWrapper>
  );
};

const S = {
  PageWrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  PageHeader: styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  PageTitle: styled.h1`
    font-size: ${({ theme }) => theme.fontSize.xlarge};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    color: ${({ theme }) => theme.color.text};
    margin: 0;
  `,
  PageDescription: styled.p`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    margin: 0;
  `,
  SectionDesc: styled.p`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
    margin: 0 0 8px;
  `,
};
