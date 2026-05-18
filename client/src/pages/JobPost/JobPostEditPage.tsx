import { useParams } from 'react-router-dom';
import { JobPostEditForm } from 'widgets/jobPost/jobPostForm/JobPostEditForm';

const JobPostEditPage = () => {
  const { id } = useParams();
  const postId = Number(id);

  if (!id || Number.isNaN(postId)) {
    return <div>잘못된 공고 ID입니다.</div>;
  }

  return <JobPostEditForm postId={postId} />;
};

export default JobPostEditPage;
