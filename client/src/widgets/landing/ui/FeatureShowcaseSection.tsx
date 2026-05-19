import { FEATURE_SHOWCASES } from '../model/content';
import { SectionHeader } from './SectionHeader';
import * as L from './landing.styled';
import * as S from './FeatureShowcaseSection.styled';

export const FeatureShowcaseSection = () => (
  <L.LandingSection id="landing-showcase" as={S.Section}>
    <L.LandingContainer>
      <SectionHeader
        tag="How it works"
        title="기능 설명"
        subtitle="실제 화면으로 확인하는 잇다의 핵심 기능"
      />

      {FEATURE_SHOWCASES.map((item, index) => (
        <S.Showcase key={item.id} $reverse={item.reverse} $isFirst={index === 0}>
          <S.Content>
            <S.ShowcaseTitle>{item.title}</S.ShowcaseTitle>
            <S.BulletList>
              {item.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </S.BulletList>
          </S.Content>

          <S.Media $duo={item.duo}>
            {item.images.map((img) => (
              <img key={img.src} src={img.src} alt={img.alt} loading="lazy" />
            ))}
          </S.Media>
        </S.Showcase>
      ))}
    </L.LandingContainer>
  </L.LandingSection>
);
