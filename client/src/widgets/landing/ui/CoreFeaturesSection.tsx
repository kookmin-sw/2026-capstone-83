import { CORE_FEATURES } from '../model/content';
import { FEATURES_SECTION_ID } from './HeroSection';
import { LandingLucideIcon } from './LandingLucideIcon';
import { SectionHeader } from './SectionHeader';
import * as L from './landing.styled';
import * as S from './CoreFeaturesSection.styled';

export const CoreFeaturesSection = () => (
  <L.LandingSection id={FEATURES_SECTION_ID} as={S.Section}>
    <L.LandingContainer>
      <SectionHeader
        tag="Features"
        title="핵심 기능"
        subtitle="일용직 구인·구직에 최적화된 기능들을 제공합니다"
      />
      <S.Grid>
        {CORE_FEATURES.map(({ icon, title, description }) => (
          <S.Card key={title}>
            <S.IconWrap>
              <LandingLucideIcon icon={icon} variant="primary" />
            </S.IconWrap>
            <S.CardTitle>{title}</S.CardTitle>
            <S.CardDescription>{description}</S.CardDescription>
          </S.Card>
        ))}
      </S.Grid>
    </L.LandingContainer>
  </L.LandingSection>
);
