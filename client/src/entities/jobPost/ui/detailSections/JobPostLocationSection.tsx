
import Section from 'shared/ui/Layout/Section';
import styled from 'styled-components'

export const JobPostLocationSection = ({ address }: { address: string }) => {

  if (!address) {
    return <div>로딩 중...</div>; // 또는 null
  }

  return (
    <Section title="근무지">
      <S.LocationText>{address}</S.LocationText>
      <S.MapPlaceholder>
        {/* 실제 지도 API (Naver/Kakao)가 들어갈 자리 */}
        <div className="inner">지도가 표시되는 영역입니다.</div>
      </S.MapPlaceholder>
    </Section>
  );
};

const S = {
  LocationText: styled.p` margin-bottom: 16px; color: ${({ theme }) => theme.color.thirdText}; `,
  MapPlaceholder: styled.div`
    width: 100%;
    height: 300px;
    background: #f4f4f4;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    border: 1px solid ${({ theme }) => theme.color.border};
  `
};