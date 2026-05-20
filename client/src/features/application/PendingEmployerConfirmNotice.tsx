import styled from 'styled-components';

/** 제안 수락 후 PENDING — 구직자 화면 안내 */
export const PendingEmployerConfirmNotice = () => (
  <S.Notice>고용주 최종 확정을 기다리는 중입니다.</S.Notice>
);

const S = {
  Notice: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
};
