import styled from 'styled-components';
import type { JobPost } from 'entities/jobPost/model/types/jobPost.type';
import { hoverOverlay } from 'shared/styles/hoverOverlay';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';

interface Props {
  jobPosts: JobPost[];
  selectedId: number | null;
  onSelect: (id: number) => void;
  isLoading?: boolean;
}

/** 공고 선택 탭 (가로 스크롤) — 재사용 가능 */
export const JobPostSelectTabs = ({ jobPosts, selectedId, onSelect, isLoading }: Props) => {
  if (isLoading) return <Loading message="공고 목록을 불러오는 중..." />;
  if (jobPosts.length === 0) return <Empty description="등록된 공고가 없습니다." />;

  return (
    <S.TabList>
      {jobPosts.map((post) => (
        <S.Tab
          key={post.id}
          $active={selectedId === post.id}
          onClick={() => onSelect(post.id)}
        >
          <S.TabTitle>{post.title}</S.TabTitle>
          <S.TabMeta>{post.workDate} · {post.location}</S.TabMeta>
        </S.Tab>
      ))}
    </S.TabList>
  );
};

const S = {
  TabList: styled.div`
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 4px;
  `,
  Tab: styled.button<{ $active: boolean }>`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 16px 20px;
    min-width: 200px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    border: ${({ theme, $active }) =>
      $active ? `2px solid ${theme.color.primary}` : `1px solid ${theme.color.border}`};
    background-color: ${({ theme, $active }) =>
      $active ? theme.color.secondary : theme.color.white};
    cursor: pointer;
    text-align: left;
    transition: all 0.15s ease;
    flex-shrink: 0;

    ${hoverOverlay}
  `,
  TabTitle: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  `,
  TabMeta: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
  `,
};
