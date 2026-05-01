
import { useNavigate } from 'react-router-dom';
import Button from 'shared/ui/Button/Button';
import styled from 'styled-components'
import { JobPostList } from 'widgets/jobPost/jobpost-list/ui/JobPostList';

const MainPage = () => {

  const navigate = useNavigate();

  const handleNavigateToCreate = () => {
    navigate('/jobpost/create');
  }

  return (
    <MainPageStyle>
      <h1>MainPage</h1>
      <Button scheme="primary" buttonSize="medium" onClick={handleNavigateToCreate}>공고 생성</Button>

      <JobPostList />
    </MainPageStyle>
  )
}

const MainPageStyle = styled.div``;

export default MainPage