

import styled from 'styled-components'
import { JobPostCreateForm } from 'widgets/jobPost/jobPostForm/JobPostCreateForm';

const JobPostCreatePage = () => {
  return (
    <JobPostCreatePageStyle>

      <JobPostCreateForm />
    </JobPostCreatePageStyle>
  )
}

const JobPostCreatePageStyle = styled.div``;

export default JobPostCreatePage