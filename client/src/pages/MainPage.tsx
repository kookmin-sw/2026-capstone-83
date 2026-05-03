
import { useLogout } from 'entities/auth/model/hooks/useAuth';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import { useNavigate } from 'react-router-dom';
import Button from 'shared/ui/Button/Button';
import styled from 'styled-components'
import { JobPostList } from 'widgets/jobPost/jobpost-list/ui/JobPostList';

const MainPage = () => {

  const navigate = useNavigate();
  const { mutate } = useLogout();
  const { isLoggedIn } = useAuthStore();

  const handleNavigateToCreate = () => {
    navigate('/jobpost/create');
  }

  const handleNavigateToLogin = () => {
    navigate('/login');
  }

  const handleLogout = () => {
    mutate()
  }

  return (
    <MainPageStyle>
      <h1>MainPage</h1>
      <Button scheme="primary" buttonSize="medium" onClick={handleNavigateToCreate}>공고 생성</Button>
      {isLoggedIn ? <Button scheme='primary' buttonSize='medium' onClick={handleLogout}>로그아웃</Button> : <Button scheme='primary' buttonSize='medium' onClick={handleNavigateToLogin}>로그인</Button>}

      <JobPostList />
    </MainPageStyle>
  )
}

const MainPageStyle = styled.div``;

export default MainPage