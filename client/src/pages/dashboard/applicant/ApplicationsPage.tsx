import styled from 'styled-components';
import { ApplicationListByStatus } from 'widgets/application/ApplicationListByStatus';

const ApplicationsPage = () => {
  return (
    <S.PageWrapper>
      <S.Header>
        <S.Title>지원 이력</S.Title>
        <S.Description>지원한 공고의 현황을 확인할 수 있습니다.</S.Description>
      </S.Header>

      <ApplicationListByStatus />
    </S.PageWrapper>
  );
};

const S = {
  PageWrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  Header: styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
  `,
  Title: styled.h1`
    font-size: ${({ theme }) => theme.fontSize.xlarge};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    margin: 0;
  `,
  Description: styled.p`
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.small};
    margin: 0;
  `,
};

export default ApplicationsPage;
