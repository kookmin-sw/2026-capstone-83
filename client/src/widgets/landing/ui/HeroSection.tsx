import type { MouseEvent } from 'react';
import { ExternalLink } from 'lucide-react';
import { useTheme } from 'styled-components';
import { Link } from 'react-router-dom';
import { GITHUB_REPO_URL } from '../model/content';
import { HeroJobSearch } from './HeroJobSearch';
import * as L from './landing.styled';
import * as S from './HeroSection.styled';

const FEATURES_SECTION_ID = 'landing-features';

export const HeroSection = () => {
  const theme = useTheme();

  const scrollToFeatures = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.getElementById(FEATURES_SECTION_ID)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <S.Hero>
      <S.BgShapes aria-hidden>
        <S.Shape $variant={1} />
        <S.Shape $variant={2} />
        <S.Shape $variant={3} />
      </S.BgShapes>

      <S.HeroInner>
        <S.Badge>2026 Capstone Design Project - 83</S.Badge>
        <S.Title>
          사람과 일자리를
          <br />
          <S.GradientSpan>잇다</S.GradientSpan>
        </S.Title>
        <S.Description>
          <strong>일용직 특화 매칭 플랫폼</strong>. <br />
          에이전시 없이, 더 빠르고 직관적으로.
        </S.Description>

        <S.Actions>
          {/* <S.ActionButtons>
            <L.PrimaryButton as={Link} to="/jobposts">
              <ExternalLink size={20} strokeWidth={2} color={theme.color.white} aria-hidden />
              공고 둘러보기
            </L.PrimaryButton>
            <L.SecondaryButton href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
              <S.GithubIcon aria-hidden />
              GitHub
            </L.SecondaryButton>
          </S.ActionButtons> */}
          <HeroJobSearch />
        </S.Actions>

        <S.ScrollLink>
          <L.TextButton href={`#${FEATURES_SECTION_ID}`} onClick={scrollToFeatures}>
            자세히 보기 ↓
          </L.TextButton>
        </S.ScrollLink>
      </S.HeroInner>
    </S.Hero>
  );
};

export { FEATURES_SECTION_ID };
