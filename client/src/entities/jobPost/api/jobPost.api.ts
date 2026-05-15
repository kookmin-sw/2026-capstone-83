import { authClient, httpClient } from "shared/api/httpClient";
import { useAuthStore } from "entities/auth/model/store/authStore";
import type { GetJobPostsParams, JobPost, JobPostCreate, JobPostDetail, JobPostListCursor } from "../model/types/jobPost.type";
import mockJobPostData from "shared/mocks/data/mockJobPostData.json";
import { toFormData } from "shared/lib/toFormData";


//공고 목록 조회 (로그인 시 authClient로 liked 포함 조회)
export const fetchJobPosts = async (data: GetJobPostsParams): Promise<JobPostListCursor> => {
  const client = useAuthStore.getState().accessToken ? authClient : httpClient;
  const response = await client.get<JobPostListCursor>('/api/v1/job-posts', {
    params: data,
  });
  return response.data;
};

// body 버전
// export const fetchJobPosts = async (data: GetJobPostsParams): Promise<JobPostListCursor> => {
//   // 기존 GET + params 방식에서 POST + body 방식으로 변경
//   const response = await httpClient.post<JobPostListCursor>('/api/v1/job-posts', data);
//   return response.data;
// };


//공고 상세 조회 (로그인 시 authClient로 liked 포함 조회)
export const fetchJobPost = async (id: number): Promise<JobPostDetail> => {
  const client = useAuthStore.getState().accessToken ? authClient : httpClient;
  const response = await client.get<JobPostDetail>(`/api/v1/job-posts/${id}`);
  return response.data;
};

//공고 생성
export const createJobPost = async (data: JobPostCreate) => {
  // form data 변환 유틸함수
  const formData = toFormData(data);

  const response = await authClient.post('/api/v1/job-posts', formData,
    {
      params: {
        workplaceId: data.workplaceId,
      },
    }
  );
  return response.data;
};

//공고 수정 (서버에 PUT 엔드포인트 없음 - 추후 추가 시 활성화)
// export const updateJobPost = async (data: JobPostUpdate) => {
//   const { id, ...updateFields } = data;
//   const formData = toFormData(updateFields);
//   const response = await authClient.put(`/api/v1/job-posts/${id}`, formData);
//   return response.data;
// }

//공고 삭제 (서버에 DELETE 엔드포인트 없음 - 추후 추가 시 활성화)
// export const deleteJobPost = async (id: number) => {
//   const response = await authClient.delete(`/api/v1/job-posts/${id}`);
//   return response.data;
// }

//공고 마감 처리
export const closeJobPost = async (id: number) => {
  const response = await authClient.patch(`/api/v1/job-posts/${id}/close`);
  return response.data;
}

//캘린더용 날짜 범위 공고 조회 (고용주)
export const fetchJobPostsByDateRange = async (start: string, end: string) => {
  const response = await authClient.get(`/api/v1/job-posts/employer/calendar`, {
    params: { start, end },
  });
  return response.data;
}


//고용주 본인 공고 목록 조회
export const fetchJobPostsByEmployer = async (data: GetJobPostsParams): Promise<JobPostListCursor> => {
  const response = await authClient.get<JobPostListCursor>('/api/v1/job-posts/employer',
    {
      params: data,
    }
  );
  return response.data;
}


// 공고 좋아요 토글
export const likeJobPost = async (id: number) => {
  const response = await authClient.post(`/api/v1/job-posts/${id}/like`);
  return response.data;
}


// export const unlikeJobPost = async (id: number) => {
//   const response = await authClient.post(`/api/v1/job-posts/${id}/unlike`);
//   return response.data;
// };


//=========================mock API 함수 ======================================
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
