import type { JobPost, JobPostCreate, JobPostDetail } from "../model/types/jobPost.type";
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

export const createMockJobPost = (data: Partial<JobPostCreate>): Promise<JobPostDetail> => {
  return new Promise((resolve) => {
    console.log('Creating job post with data:', data);
    const newPost: JobPostDetail = {
      "id": 1,
      "title": "성수동 신축 현장 자재 운반",
      "company": "워크브릿지 건설",
      "companyLogoUrl": "https://api.dicebear.com/7.x/identicon/svg?seed=WorkBridge",
      "location": "서울 성동구 성수동",
      "wage": 165000,
      "wageType": "DAILY",
      "totalSlots": 20,
      "filledSlots": 8,
      "workDate": "2026/05/10",
      "workStart": "08:00",
      "workEnd": "17:00",
      "postStatus": "OPEN",
      "applyStatus": "NONE",
      "deadline": "2026/05/05",
      "liked": false,
      "description": "성수동 아파트 신축 현장에서 자재 정리를 도와주실 분을 모집합니다.",
      "descriptionUrl": "https://picsum.photos/seed/1/800/1200",
      "createdAt": "2026/04/20",
      "updatedAt": "2026/04/20",
      "requirements": [
        "신체 건강하신 분",
        "안전화 소지자"
      ],
      "benefits": [
        "중식 제공",
        "간식 제공"
      ],
      "tasks": [
        "자재 운반",
        "폐자재 정리",
        "현장 청소"
      ],
      "items": [
        "안전화",
        "장갑"
      ]
    };

    resolve(newPost);
  });
};
