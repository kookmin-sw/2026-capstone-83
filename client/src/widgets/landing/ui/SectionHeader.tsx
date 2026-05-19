import * as S from './SectionHeader.styled';

type SectionHeaderProps = {
  tag: string;
  title: string;
  subtitle: string;
};

export const SectionHeader = ({ tag, title, subtitle }: SectionHeaderProps) => (
  <S.Header>
    <S.Tag>{tag}</S.Tag>
    <S.Title>{title}</S.Title>
    <S.Subtitle>{subtitle}</S.Subtitle>
  </S.Header>
);
