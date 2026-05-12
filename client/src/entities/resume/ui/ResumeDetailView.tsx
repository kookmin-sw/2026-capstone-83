import { ResumeProfileSection } from './detailSections/ResumeProfileSection';
import { ResumeCareerSection } from './detailSections/ResumeCareerSection';
import type { ResumeResponse } from '../model/types/resume.type';
import Article from 'shared/ui/Layout/Article';

interface Props {
  data: ResumeResponse;
  actions?: React.ReactNode; // 수정 버튼 등 슬롯
}

/**
 * 이력서 상세 표현 컴포넌트 (순수 UI)
 * 데이터 페칭 로직 없이 props로 받은 데이터를 렌더링합니다.
 */
export const ResumeDetailView = ({ data, actions }: Props) => {
  return (
    <Article>
      <ResumeProfileSection data={data} actions={actions} />
      <ResumeCareerSection data={data} />
    </Article>
  );
};
