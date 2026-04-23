import type { JobPost } from "../model/types/jobPost.type";
import mockJobPostData from "shared/mocks/data/mockJobPostData.json";

//mock API 함수 -
export const fetchMockJobPosts = (): Promise<JobPost[]> => {
  return new Promise((resolve) => {

    resolve(mockJobPostData as JobPost[]);

  });
};