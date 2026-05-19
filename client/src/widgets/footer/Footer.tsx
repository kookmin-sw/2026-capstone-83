import KoreanIconLogo from 'shared/assets/KoreanIconLogo.svg';
import * as S from './Footer.styled';

const GITHUB_REPO_URL = 'https://github.com/kookmin-sw/2026-capstone-83';

const Footer = () => {
  return (
    <S.FooterWrapper>
      <S.FooterInner>
        <S.FooterContent>
          <S.LogoLink to="/" aria-label="잇다 홈">
            <S.LogoImg src={KoreanIconLogo} alt="잇다 로고" />
          </S.LogoLink>

          <S.FooterText>
            2026 Capstone Design Project — 일용직 시장의 구직자와 고용주를 잇다
          </S.FooterText>

          <S.FooterLinks>
            <S.FooterLink href={GITHUB_REPO_URL} target="_blank" rel="noopener noreferrer">
              GitHub
            </S.FooterLink>
          </S.FooterLinks>
        </S.FooterContent>
      </S.FooterInner>
    </S.FooterWrapper>
  );
};

export default Footer;
