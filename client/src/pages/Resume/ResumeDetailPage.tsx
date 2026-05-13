import styled from 'styled-components';
import { ResumeDetailContent } from 'widgets/resume/ResumeDetail/ui/ResumeDetailContent';

const ResumeDetailPage = () => {
  return (
    <ResumeDetailPageStyle>
      <ResumeDetailContent />
    </ResumeDetailPageStyle>
  );
};

const ResumeDetailPageStyle = styled.div``;

export default ResumeDetailPage;
