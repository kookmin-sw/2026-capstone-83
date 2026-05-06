import Section from 'shared/ui/Layout/Section';
import styled from 'styled-components';
import Loading from 'shared/ui/Loading/Loading';
import NaverMap from 'shared/ui/NaverMap/NaverMap';

export const JobPostLocationSection = ({ address }: { address: string }) => {

  if (!address) {
    return <Loading message="근무지 정보를 불러오는 중..." />;
  }

  return (
    <Section title="근무지">
      <S.LocationText>{address}</S.LocationText>
      <NaverMap address={address} height="300px" />
    </Section>
  );
};

const S = {
  LocationText: styled.p`
    margin-bottom: 16px;
    color: ${({ theme }) => theme.color.thirdText};
  `,
};
