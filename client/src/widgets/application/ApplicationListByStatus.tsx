import { useMemo } from 'react';
import styled from 'styled-components';
import { useApplications } from 'entities/application/model/hooks/useApplications';
import type { ApplicationWithJobPost } from 'entities/application/model/types/application.type';
import { JobPostCard } from 'entities/jobPost/ui/JobPostCard';
import { DDay } from 'entities/jobPost/ui/JobPost.styled';
import { AcceptOfferButton } from 'features/application/AcceptOfferButton';
import { RejectOfferButton } from 'features/application/RejectOfferButton';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';

export const ApplicationListByStatus = () => {
  const { data: applications, isLoading } = useApplications();

  const grouped = useMemo(() => {
    if (!applications) return { applied: [] as ApplicationWithJobPost[], pending: [] as ApplicationWithJobPost[] };
    const applied: ApplicationWithJobPost[] = [];
    const pending: ApplicationWithJobPost[] = [];
    applications.forEach((app) => {
      if (app.applicationStatus === 'APPLIED') applied.push(app);
      else if (app.applicationStatus === 'PENDING') pending.push(app);
    });
    return { applied, pending };
  }, [applications]);

  if (isLoading) return <Loading message="지원 이력을 불러오는 중..." />;
  if (!applications || applications.length === 0) return <Empty message="지원 이력이 없습니다." />;

  return (
    <S.TwoColumn>
      {/* 왼쪽: 지원중 */}
      <S.Column>
        <S.SectionHeader>
          <S.SectionTitle>지원중</S.SectionTitle>
          <Badge scheme="primary">{grouped.applied.length}건</Badge>
        </S.SectionHeader>

        <S.CardList>
          {grouped.applied.length > 0 ? (
            grouped.applied.map((app) => (
              <S.CardItem key={app.applicationId}>
                <JobPostCard data={app} />
              </S.CardItem>
            ))
          ) : (
            <S.EmptyText>지원중인 공고가 없습니다.</S.EmptyText>
          )}
        </S.CardList>
      </S.Column>

      {/* 오른쪽: 승인 대기 */}
      <S.Column>
        <S.SectionHeader>
          <S.SectionTitle>승인 대기</S.SectionTitle>
          <Badge scheme="neutral">{grouped.pending.length}건</Badge>
        </S.SectionHeader>

        <S.CardList>
          {grouped.pending.length > 0 ? (
            grouped.pending.map((app) => (
              <S.CardItem key={app.applicationId}>
                <JobPostCard
                  data={app}
                  bottomActions={
                    <>
                      <AcceptOfferButton applicationId={app.applicationId} />
                      <RejectOfferButton applicationId={app.applicationId} />
                    </>
                  }
                />
              </S.CardItem>
            ))
          ) : (
            <S.EmptyText>승인 대기중인 공고가 없습니다.</S.EmptyText>
          )}
        </S.CardList>
      </S.Column>
    </S.TwoColumn>
  );
};

const S = {
  TwoColumn: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
    align-items: flex-start;

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
    }
  `,
  Column: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  SectionHeader: styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
  `,
  SectionTitle: styled.h3`
    font-size: ${({ theme }) => theme.fontSize.medium};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
    margin: 0;
  `,
  CardList: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  CardItem: styled.div`
    /* 카드 사이즈 축소 */
    font-size: 16px;

    & > a > div {
      padding: 16px;
      gap: 10px;
    }

    h3 {
      font-size: 20px;
    }

    span {
      font-size: 12px;
    }

    /* D-Day 텍스트 크기 유지 */
    ${DDay} {
      font-size: 16px;
    }
  `,
  EmptyText: styled.p`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
    padding: 24px 16px;
    text-align: center;
    background-color: ${({ theme }) => theme.color.background};
    border-radius: ${({ theme }) => theme.borderRadius.small};
    margin: 0;
  `,
};
