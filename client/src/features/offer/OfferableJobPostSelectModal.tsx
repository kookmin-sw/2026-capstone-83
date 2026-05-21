import { useMemo } from 'react';
import styled from 'styled-components';
import { MapPin, Calendar, Clock } from 'lucide-react';
import { useOfferableJobPosts } from 'entities/jobPost/model/hooks/useOfferableJobPosts';
import type { JobPost } from 'entities/jobPost/model/types/jobPost.type';
import { formatScheduleLine } from 'entities/jobPost/lib/jobPostCardDisplay';
import Modal from 'shared/ui/Modal/Modal';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import Button from 'shared/ui/Button/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  applicantUserId: number;
  applicantName?: string;
  onSelect: (jobPost: JobPost) => void;
  isOffering?: boolean;
}

export const OfferableJobPostSelectModal = ({
  isOpen,
  onClose,
  applicantUserId,
  applicantName,
  onSelect,
  isOffering = false,
}: Props) => {
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useOfferableJobPosts(applicantUserId, isOpen);

  const jobPosts = useMemo(
    () => data?.pages.flatMap((page) => page.contents) ?? [],
    [data],
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <S.ModalContent>
        <S.ModalHeader>
          <h3>공고 선택</h3>
          {applicantName && <S.ModalSub>{applicantName}님에게 제안할 공고</S.ModalSub>}
        </S.ModalHeader>

        {isLoading ? (
          <Loading message="제안 가능한 공고를 불러오는 중..." />
        ) : isError ? (
          <Empty message="공고 목록을 불러오지 못했습니다." />
        ) : jobPosts.length === 0 ? (
          <Empty message="제안 가능한 공고가 없습니다." />
        ) : (
          <S.List>
            {jobPosts.map((post) => (
              <S.ListItem
                key={post.id}
                type="button"
                disabled={isOffering}
                onClick={() => onSelect(post)}
              >
                <S.ItemTitle>{post.title}</S.ItemTitle>
                <S.ItemCompany>{post.company}</S.ItemCompany>
                <S.ItemMeta>
                  <span>
                    <Calendar size={12} />
                    {formatScheduleLine(post.workDate, post.workStart, post.workEnd)}
                  </span>
                  <span>
                    <MapPin size={12} />
                    {post.location}
                  </span>
                </S.ItemMeta>
                <S.ItemMeta>
                  <Clock size={12} />
                  <span>
                    모집 {post.filledSlots}/{post.totalSlots}
                  </span>
                </S.ItemMeta>
              </S.ListItem>
            ))}
          </S.List>
        )}

        {hasNextPage && (
          <S.LoadMoreWrap>
            <Button
              scheme="secondary"
              buttonSize="small"
              borderRadius="medium"
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
            >
              {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
            </Button>
          </S.LoadMoreWrap>
        )}
      </S.ModalContent>
    </Modal>
  );
};

const S = {
  ModalContent: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: min(70vh, 520px);
  `,
  ModalHeader: styled.div`
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 4px;

    h3 {
      font-size: ${({ theme }) => theme.fontSize.large};
      font-weight: ${({ theme }) => theme.fontWeight.bold};
      margin: 0;
    }
  `,
  ModalSub: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
  `,
  List: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    min-height: 0;
  `,
  ListItem: styled.button`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    width: 100%;
    padding: 12px 14px;
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    background: ${({ theme }) => theme.color.white};
    cursor: pointer;
    text-align: left;
    transition: border-color 0.15s ease, background 0.15s ease;

    &:hover:not(:disabled) {
      border-color: ${({ theme }) => theme.color.primary};
      background: ${({ theme }) => theme.color.secondary};
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `,
  ItemTitle: styled.span`
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
  `,
  ItemCompany: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
  `,
  ItemMeta: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.thirdText};

    span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
  `,
  LoadMoreWrap: styled.div`
    display: flex;
    justify-content: center;
    padding-top: 4px;
  `,
};
