import React from 'react'
import styled from 'styled-components'
import { JobPostList } from 'widgets/jobpost-list/ui/JobPostList';

const JobPostListPage = () => {
  return (
    <JobPostListPageStyle>
      <h1>JobPostListPage</h1>
      <JobPostList />
    </JobPostListPageStyle>
  )
}

const JobPostListPageStyle = styled.div``;

export default JobPostListPage