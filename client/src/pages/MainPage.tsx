import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Search } from 'lucide-react';
import { JobPostList } from 'widgets/jobPost/jobpost-list/ui/JobPostList';
import Button from 'shared/ui/Button/Button';

const MainPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    const params = keyword ? `?keyword=${encodeURIComponent(keyword)}` : '';
    navigate(`/jobposts${params}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <S.Page>
      {/* 검색바 */}
      <S.SearchSection>
        <S.SearchRow>
          <S.SearchInputWrapper>
            <Search size={20} />
            <S.SearchInput
              type="text"
              placeholder="직종, 회사명, 지역으로 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </S.SearchInputWrapper>
          <Button scheme="primary" buttonSize="smallMedium" onClick={handleSearch}>
            검색
          </Button>
        </S.SearchRow>
      </S.SearchSection>

      {/* 공고 목록 */}
      <JobPostList />
    </S.Page>
  );
};

const S = {
  Page: styled.div`
    display: flex;
    flex-direction: column;
  `,
  SearchSection: styled.section`
    display: flex;
    justify-content: center;
    padding: 24px 20px;
  `,
  SearchRow: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    max-width: 600px;
  `,
  SearchInputWrapper: styled.div`
    flex: 1;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: ${({ theme }) => theme.color.white};

    &:focus-within {
      border-color: ${({ theme }) => theme.color.primary};
      box-shadow: 0 0 0 1px ${({ theme }) => theme.color.primary};
    }

    svg {
      color: ${({ theme }) => theme.color.subText};
      flex-shrink: 0;
    }
  `,
  SearchInput: styled.input`
    flex: 1;
    border: none;
    outline: none;
    font-size: ${({ theme }) => theme.fontSize.medium};
    color: ${({ theme }) => theme.color.text};
    background: transparent;

    &::placeholder {
      color: ${({ theme }) => theme.color.subText};
    }
  `,
};

export default MainPage;
