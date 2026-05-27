import styled from 'styled-components';
import { LikedJobPostsInfiniteList } from 'widgets/jobPost/jobpost-list/ui/LikedJobPostsInfiniteList';

const LikedJobPostsPage = () => {
  return (
    <S.PageWrapper>
      <S.Header>
        <S.Title>찜한 공고</S.Title>
        <S.Description>관심 있게 표시한 공고를 모아볼 수 있습니다.</S.Description>
      </S.Header>

      <LikedJobPostsInfiniteList />
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

export default LikedJobPostsPage;
