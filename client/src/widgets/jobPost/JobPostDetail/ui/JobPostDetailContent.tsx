
import { useState } from 'react';
import { useAuthStore } from 'entities/auth/model/store/authStore';
import { useJobPost } from 'entities/jobPost/model/hooks/useJobPost';
import { JobPostDescriptionSection } from 'entities/jobPost/ui/detailSections/JobPostDescriptionSection';
import { JobPostDetailOverviewSection } from 'entities/jobPost/ui/detailSections/JobPostDetailOverviewSection';
import { JobPostLocationSection } from 'entities/jobPost/ui/detailSections/JobPostLocationSection';
import { JobPostWorkContentSection } from 'entities/jobPost/ui/detailSections/JobPostWorkContentSection';
import ApplyButton from 'features/apply/ApplyButton';
import LikeJobPostButton from 'features/like/LikeJobPostButton';
import ReportUserModal from 'features/report/ReportUserModal';
import { ReportOverviewButton } from 'features/report/ReportOverviewButton';
import { useReportEligibility } from 'features/report/useReportEligibility';
import Article from 'shared/ui/Layout/Article';
import Main from 'shared/ui/Layout/Main';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import StickyBar from 'shared/ui/StickyBar/StickyBar';


interface Props {
  postId: number;
}


export const JobPostDetailContent = ({ postId }: Props) => {

  const { data: post, isLoading, isError } = useJobPost(postId);
  const role = useAuthStore((s) => s.role);
  const isEmployer = role === 'EMPLOYER';
  const [reportOpen, setReportOpen] = useState(false);
  const canReportTarget = useReportEligibility();

  if (isLoading) return <Loading message="공고 내용을 불러오는 중입니다..." />;
  if (isError || !post) return <Empty message="공고를 찾을 수 없습니다." />;



  const { location } = post;
  const employerUserId = post.employerUserId;
  const showEmployerReport =
    !isEmployer && employerUserId != null && canReportTarget(employerUserId);

  return (
    <Main>
      <Article>
        {/* 1. 상단 개요 섹션 (비즈니스 로직인 버튼 포함) */}
        <JobPostDetailOverviewSection
          data={post}
          headerActions={
            showEmployerReport ? (
              <ReportOverviewButton onClick={() => setReportOpen(true)} />
            ) : undefined
          }
          actions={
            !isEmployer ? (
              <>
                <LikeJobPostButton jobPostId={post.id} liked={post.liked} variant="bordered" />
                <ApplyButton jobPostId={post.id} />
              </>
            ) : undefined
          }
        />

        {/* 2. 근무 내용 섹션 */}
        <JobPostWorkContentSection data={post} />

        {/* 3. 근무지 섹션 (지도 포함) */}
        <JobPostLocationSection address={location} />

        {/* 4. 상세 정보 섹션 */}
        <JobPostDescriptionSection data={post} />
      </Article>

      {/* 하단 Sticky 지원 바 */}
      {!isEmployer && (
        <StickyBar>
          <LikeJobPostButton jobPostId={post.id} liked={post.liked} variant="bordered" />
          <ApplyButton jobPostId={post.id} />
        </StickyBar>
      )}

      {showEmployerReport && employerUserId != null && (
        <ReportUserModal
          isOpen={reportOpen}
          onClose={() => setReportOpen(false)}
          targetUserId={employerUserId}
          targetLabel={post.company}
          onSuccess={() => {
            window.alert('신고가 접수되었습니다.');
          }}
        />
      )}
    </Main>
  );
};
