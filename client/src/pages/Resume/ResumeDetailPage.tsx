import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ResumeDetailContent } from 'widgets/resume/ResumeDetail/ui/ResumeDetailContent';

const ResumeDetailPage = () => {
  const { id } = useParams();

  return (
    <ResumeDetailPageStyle>
      <ResumeDetailContent resumeId={Number(id)} />
    </ResumeDetailPageStyle>
  );
};

const ResumeDetailPageStyle = styled.div``;

export default ResumeDetailPage;
