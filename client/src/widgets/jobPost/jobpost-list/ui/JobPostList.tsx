
import React, { useEffect, useState } from 'react';
import { JobPostCard } from 'entities/jobPost/ui/JobPostCard';
import * as S from './JobPostList.styled';
import { dummyJobPost } from 'entities/jobPost/ui/dummy';
import type { JobPost } from 'entities/jobPost/model/types/jobPost.type';
import { fetchMockJobPosts } from 'entities/jobPost/api/jobPost.api';

export const JobPostList = () => {
  // data fetch
  //const posts = [dummyJobPost];
  const [posts, setPosts] = useState<JobPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    fetchMockJobPosts().then((data) => {
      setPosts(data);
      setIsLoading(false);
    });
  }, []);

  if (isLoading) return <div>공고 불러오는 중...</div>;

  return (
    <S.ListContainer>
      {posts.map((post) => (
        <JobPostCard
          key={post.id}
          data={post}

        />
      ))}

      {/* 무한 스크롤 구현 시 하단에 관찰용 센서(Ref)가 들어갈 자리 */}
      <S.ObserverTarget />
    </S.ListContainer>
  );
};