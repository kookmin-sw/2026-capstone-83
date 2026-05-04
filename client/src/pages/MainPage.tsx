
import styled from 'styled-components'
import { JobPostList } from 'widgets/jobPost/jobpost-list/ui/JobPostList';

const MainPage = () => {


  return (
    <MainPageStyle>


      <JobPostList />
    </MainPageStyle>
  )
}

const MainPageStyle = styled.div``;

export default MainPage