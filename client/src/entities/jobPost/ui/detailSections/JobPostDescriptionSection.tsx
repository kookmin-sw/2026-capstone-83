import React from 'react'
import Section from 'shared/ui/Layout/Section';
import styled from 'styled-components'
import type { JobPostDescriptionProps, JobPostDetail } from '../../model/types/jobPost.type';

export const JobPostDescriptionSection = ({ data }: { data: JobPostDescriptionProps }) => {

  if (!data) {
    return <div>로딩 중...</div>; // 또는 null
  }

  const { description, descriptionUrl } = data;

  return (
    <Section title="상세 정보">
      <S.DescriptionWrapper>
        {descriptionUrl && (
          <img src={descriptionUrl} alt="상세 설명 이미지" className="desc-img" />
        )}
        <div className="text-content">
          {description}
        </div>
      </S.DescriptionWrapper>
    </Section>
  );
};

const S = {
  DescriptionWrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 32px;
    .desc-img { width: 100%; border-radius: 8px; }
    .text-content { 
      white-space: pre-wrap; 
      line-height: 1.8; 
      color: ${({ theme }) => theme.color.text};
    }
  `
};