import styled, { css } from 'styled-components';

export const Section = styled.section`
  background: ${({ theme }) => theme.color.white};
`;

export const Showcase = styled.article<{ $reverse?: boolean; $isFirst?: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 48px;
  align-items: center;
  padding: 56px 0;
  border-bottom: 1px solid rgba(206, 206, 206, 0.35);

  ${({ $isFirst }) =>
    $isFirst &&
    css`
      padding-top: 0;
    `}

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  ${({ $reverse }) =>
    $reverse &&
    css`
      .showcase-content {
        order: 2;
      }
      .showcase-media {
        order: 1;
      }
    `}

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 40px 0;

    .showcase-content,
    .showcase-media {
      order: unset !important;
    }
  }
`;

export const Content = styled.div.attrs({ className: 'showcase-content' })``;

export const ShowcaseTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0 0 20px;
  color: ${({ theme }) => theme.color.text};
`;

export const BulletList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;

  li {
    position: relative;
    padding-left: 22px;
    font-size: 0.95rem;
    color: ${({ theme }) => theme.color.thirdText};
    line-height: 1.75;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0.55em;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: ${({ theme }) => theme.color.primary};
    }
  }
`;

export const Media = styled.div.attrs({ className: 'showcase-media' })<{ $duo?: boolean }>`
  border-radius: ${({ theme }) => theme.borderRadius.large};
  overflow: hidden;
  border: 1px solid rgba(206, 206, 206, 0.45);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
  background: ${({ theme }) => theme.color.background};

  img {
    display: block;
    width: 100%;
    height: auto;
  }

  ${({ $duo }) =>
    $duo &&
    css`
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      padding: 12px;
      border: none;
      box-shadow: none;
      background: transparent;

      img {
        border-radius: ${({ theme }) => theme.borderRadius.medium};
        border: 1px solid rgba(206, 206, 206, 0.45);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.06);
      }

      @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
        grid-template-columns: 1fr;
      }
    `}
`;
