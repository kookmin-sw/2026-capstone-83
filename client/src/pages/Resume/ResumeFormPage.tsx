import styled from 'styled-components';
import { ResumeFormContent } from 'widgets/resume/ResumeForm/ui/ResumeFormContent';

const ResumeFormPage = () => {
  return (
    <ResumeFormPageStyle>
      <h1>이력서 작성</h1>
      <ResumeFormContent />
    </ResumeFormPageStyle>
  );
};

const ResumeFormPageStyle = styled.div`
  h1 {
    max-width: 1200px;
    margin: 0 auto;
    padding: 32px 20px 0;
    font-size: ${({ theme }) => theme.fontSize.xlarge};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
  }
`;

export default ResumeFormPage;
