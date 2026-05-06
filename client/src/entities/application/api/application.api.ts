import { authClient } from "shared/api/httpClient";


// 공고 지원 (구직자, auth)
export const applyJopPost = async (id: number) => {
  const response = authClient.post(`/api/vi/job-posts/${id}/apply`);
  return (await response).data;
}


// 근무 일정 조회
//export const fetchJobSchedules = 
