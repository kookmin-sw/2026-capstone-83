
import { useJobPost } from 'entities/jobPost/model/hooks/useJobPost';
import { useParams } from 'react-router-dom';

import styled from 'styled-components'
import { JobPostDetailContent } from 'widgets/jobPost/JobPostDetail/ui/JobPostDetailContent';

const JobPostDetailPage = () => {

  const { id } = useParams();


  return (
    <JobPostDetailPageStyle>
      <JobPostDetailContent postId={Number(id)} />
    </JobPostDetailPageStyle>
  )
}

const JobPostDetailPageStyle = styled.div``;

export default JobPostDetailPage