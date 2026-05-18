import { Link, useParams } from 'react-router-dom';
import {
  useActivateUser,
  useManagerUser,
} from 'entities/manager/model/hooks/useManagerQueries';
import {
  formatDateTime,
  USER_ROLE_LABEL,
  USER_STATUS_LABEL,
} from 'entities/manager/lib/labels';
import UserSuspendForm from 'features/manager/UserSuspendForm';
import Section from 'shared/ui/Layout/Section';
import Loading from 'shared/ui/Loading/Loading';
import Button from 'shared/ui/Button/Button';
import Badge from 'shared/ui/Badge/Badge';
import {
  DetailGrid,
  PageDesc,
  PageHeader,
  PageTitle,
} from 'widgets/manager/admin.styled';

const AdminUserDetailPage = () => {
  const { id } = useParams();
  const userId = Number(id);
  const { data: user, isLoading, refetch } = useManagerUser(userId);
  const { mutate: activate, isPending: activating } = useActivateUser(userId);

  const handleActivate = () => {
    if (!window.confirm('정지를 해제하시겠습니까?')) return;
    activate(undefined, {
      onSuccess: () => alert('정지가 해제되었습니다.'),
      onError: () => alert('처리에 실패했습니다.'),
    });
  };

  if (isLoading) return <Loading />;
  if (!user) return <p>회원을 찾을 수 없습니다.</p>;

  return (
    <>
      <PageHeader>
        <PageTitle>{user.name}</PageTitle>
        <PageDesc>
          <Link to="/admin/users">← 회원 목록</Link>
        </PageDesc>
      </PageHeader>

      <Section title="기본 정보">
        <DetailGrid>
          <dt>이메일</dt>
          <dd>{user.email}</dd>
          <dt>연락처</dt>
          <dd>{user.phone || '-'}</dd>
          <dt>역할</dt>
          <dd>{USER_ROLE_LABEL[user.role]}</dd>
          <dt>상태</dt>
          <dd>
            <Badge scheme={user.status === 'ACTIVE' ? 'success' : 'error'}>
              {USER_STATUS_LABEL[user.status]}
            </Badge>
          </dd>
          <dt>가입일</dt>
          <dd>{formatDateTime(user.createdAt)}</dd>
          <dt>신고 접수</dt>
          <dd>{user.reportCount}건</dd>
          <dt>매칭 수</dt>
          <dd>{user.matchCount}</dd>
        </DetailGrid>
      </Section>

      {user.status === 'SUSPENDED' && (
        <Section title="정지 정보">
          <DetailGrid>
            <dt>정지 시작</dt>
            <dd>{formatDateTime(user.suspendedAt)}</dd>
            <dt>정지 종료</dt>
            <dd>
              {user.suspendedUntil ? formatDateTime(user.suspendedUntil) : '영구 정지'}
            </dd>
            <dt>사유</dt>
            <dd>{user.suspendReason || '-'}</dd>
          </DetailGrid>
          <Button
            scheme="secondary"
            buttonSize="medium"
            borderRadius="medium"
            disabled={activating}
            onClick={handleActivate}
            style={{ marginTop: 16 }}
          >
            {activating ? '처리 중...' : '정지 해제'}
          </Button>
        </Section>
      )}

      {user.status === 'ACTIVE' && (
        <Section title="정지 처리">
          <UserSuspendForm userId={userId} onSuccess={() => refetch()} />
        </Section>
      )}
    </>
  );
};

export default AdminUserDetailPage;
