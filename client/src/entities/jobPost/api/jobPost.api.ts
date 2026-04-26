import type { JobPost, JobPostDetail } from "../model/types/jobPost.type";
import mockJobPostData from "shared/mocks/data/mockJobPostData.json";

//mock API 함수 -
export const fetchMockJobPosts = (): Promise<JobPost[]> => {
  return new Promise((resolve) => {

    resolve(mockJobPostData as JobPost[]);

  });
};

export const fetchMockJobPost = (id: number): Promise<JobPostDetail> => {
  return new Promise((resolve, reject) => {
    const post = (mockJobPostData as JobPostDetail[]).find((p) => p.id === id);
    if (post) {
      resolve(post);
    } else {
      reject(new Error('Post not found'));
    }
  });
};
