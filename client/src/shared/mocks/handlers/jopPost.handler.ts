import { http, HttpResponse } from 'msw';
import mockJobPostData from '../data/mockJobPostData.json'
import type { JobPost } from 'entities/jobPost/model/types/jobPost.type';
import { BASE_URL } from './constants';


let mockJobPosts = mockJobPostData;



export const jobPostHandlers = [
  /**
   * 1. 공고 목록 조회 (Infinite Scroll 지원)
   * GET /api/v1/job-posts?cursor=10&size=10
   */
  http.get(`${BASE_URL}/api/v1/job-posts`, ({ request }) => {
    const url = new URL(request.url);
    const cursor = Number(url.searchParams.get('cursor')) || 0;
    const size = Number(url.searchParams.get('size')) || 10;

    // 현재 커서 다음 데이터부터 size만큼 자르기
    const startIndex = mockJobPosts.findIndex(p => p.id === cursor) + 1;
    const pagedData = mockJobPosts.slice(startIndex, startIndex + size);

    // 다음 페이지가 있는지 확인
    const hasNext = startIndex + size < mockJobPosts.length;
    const nextCursor = hasNext ? pagedData[pagedData.length - 1].id : null;

    return HttpResponse.json({
      jobPosts: pagedData,
      nextCursor: nextCursor,
      hasNext: hasNext,
    });
  }),

  /**
   * 2. 공고 상세 조회
   * GET /api/v1/job-posts/:id
   */
  http.get(`${BASE_URL}/api/v1/job-posts/:id`, ({ params }) => {
    const { id } = params;
    const post = mockJobPosts.find((p) => p.id === Number(id));

    if (!post) {
      return new HttpResponse(null, { status: 404 });
    }

    return HttpResponse.json(post);
  }),

  /**
   * 3. 공고 생성 (JSON 전송 방식)
   * POST /api/v1/job-posts
   */
  http.post(`${BASE_URL}/api/v1/job-posts`, async ({ request }) => {
    try {
      const formData = await request.formData();

      // 1. FormData에서 값들을 추출하고 타입에 맞게 변환합니다.
      // splitByComma를 거쳐 전송된 데이터는 쉼표로 연결된 문자열입니다.
      const newPostData = {
        title: formData.get('title') as string,
        company: formData.get('company') as string,
        location: formData.get('location') as string,
        wage: Number(formData.get('wage')),
        wageType: formData.get('wageType') as string,
        workDate: formData.get('workDate') as string,
        workStart: formData.get('workStart') as string,
        workEnd: formData.get('workEnd') as string,
        deadline: formData.get('deadline') as string,
        description: formData.get('description') as string,

        // 배열 형태의 데이터들을 다시 복원합니다.
        tasks: (formData.get('tasks') as string)?.split(',') || [],
        requirements: (formData.get('requirements') as string)?.split(',') || [],
        benefits: (formData.get('benefits') as string)?.split(',') || [],
        items: (formData.get('items') as string)?.split(',') || [],

        // 이미지 파일 (나중에 추가될 필드 예시)
        companyLogo: formData.get('companyLogo'),

      };

      // 2. ID 생성 및 기본값 설정 (무결성 유지)
      const nextId = mockJobPosts.length > 0
        ? Math.max(...mockJobPosts.map(p => p.id)) + 1
        : 1;

      const newPost = {
        ...newPostData,
        id: nextId,
        companyLogoUrl: "https://api.dicebear.com/7.x/identicon/svg?seed=New",
        descriptionUrl: `https://picsum.photos/seed/${nextId}/800/1200`,
        totalSlots: 10,
        filledSlots: 0,
        leftDays: 7,
        postStatus: "OPEN",
        applyStatus: "NONE",
        liked: false,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0],
      };

      // 3. 인메모리 배열 최상단에 추가하여 리스트 갱신 확인
      mockJobPosts = [newPost, ...mockJobPosts];

      console.log('MSW: FormData 기반 공고 생성 완료', newPost);

      return HttpResponse.json(newPost, { status: 201 });
    } catch (error) {
      console.error('MSW FormData 처리 에러:', error);
      return new HttpResponse('Invalid FormData', { status: 400 });
    }
  }),
];