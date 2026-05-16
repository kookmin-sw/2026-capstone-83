import styled from 'styled-components';
import Main from 'shared/ui/Layout/Main';
import { ResumeList } from 'widgets/resume/ResumeList/ui/ResumeList';


const ResumeListPage = () => {
  return (
    <Main>
      <S.PageHeader>
        <h1>인재 정보</h1>
      </S.PageHeader>
      <ResumeList />
    </Main>
  );
};

const S = {
  PageHeader: styled.div`
    margin-bottom: 8px;
    padding: 0 20px;
    h1 {
      font-size: ${({ theme }) => theme.fontSize.xlarge};
      font-weight: ${({ theme }) => theme.fontWeight.bold};
    }
  `,
};

export default ResumeListPage;
