import { FullBleed } from './landing.styled';
import { HeroSection } from './HeroSection';
import { CoreFeaturesSection } from './CoreFeaturesSection';
import { FeatureShowcaseSection } from './FeatureShowcaseSection';

/** 메인 페이지 상단 랜딩 섹션 (히어로 · 핵심 기능 · 기능 설명) */
export const LandingIntro = () => (
  <FullBleed>
    <HeroSection />
    <CoreFeaturesSection />
    <FeatureShowcaseSection />
  </FullBleed>
);
