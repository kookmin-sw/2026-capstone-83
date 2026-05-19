import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from 'styled-components';
import * as S from './HeroJobSearch.styled';

const SEARCH_PLACEHOLDER = '오늘 당장 일할 곳, 업종·지역·회사명으로 찾아보세요';

export const HeroJobSearch = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [keyword, setKeyword] = useState('');

  const handleSearch = () => {
    const params = keyword.trim() ? `?keyword=${encodeURIComponent(keyword.trim())}` : '';
    navigate(`/jobposts${params}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <S.SearchForm
      onSubmit={(e) => {
        e.preventDefault();
        handleSearch();
      }}
    >
      <S.SearchInputWrapper>
        <Search size={20} strokeWidth={2} color={theme.color.subText} aria-hidden />
        <S.SearchInput
          type="search"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={SEARCH_PLACEHOLDER}
          aria-label="공고 검색"
        />
      </S.SearchInputWrapper>
      <S.SearchButton type="submit">검색</S.SearchButton>
    </S.SearchForm>
  );
};
