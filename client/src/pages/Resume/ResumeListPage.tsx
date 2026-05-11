import styled from 'styled-components';
import Main from 'shared/ui/Layout/Main';
import { ResumeList } from 'widgets/resume/ResumeList/ui/ResumeList';
import Button from 'shared/ui/Button/Button';
import { useNavigate } from 'react-router-dom';

const ResumeListPage = () => {
  const navigate = useNavigate();
  return (
    <Main>
      <Button scheme='primary' buttonSize='medium' onClick={() => { navigate('/resume/edit') }}>이력서 작성</Button>
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
