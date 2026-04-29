
import { JobPostBasicInfoFields } from 'entities/jobPost/ui/InputFields/JobPostBasicInfoFields';
import React from 'react'
import styled from 'styled-components'
import { JobPostCreateForm } from 'widgets/jobPost/jobPostForm/JobPostCreateForm';

const JobPostCreatePage = () => {
  return (
    <JobPostCreatePageStyle>
      <h1>JobPostCreatePage</h1>
      <JobPostCreateForm />
    </JobPostCreatePageStyle>
  )
}

const JobPostCreatePageStyle = styled.div``;

export default JobPostCreatePage