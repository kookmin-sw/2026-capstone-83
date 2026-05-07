
import { useAuthStore } from 'entities/auth/model/store/authStore';
import styled from 'styled-components'
import { JobPostList } from 'widgets/jobPost/jobpost-list/ui/JobPostList';

const MainPage = () => {
  const { role } = useAuthStore();

  return (
    <MainPageStyle>
      {role}

      <JobPostList />
    </MainPageStyle>
  )
}

const MainPageStyle = styled.div``;

export default MainPage