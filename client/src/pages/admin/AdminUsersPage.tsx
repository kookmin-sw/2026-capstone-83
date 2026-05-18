import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserType } from 'entities/user/model/types/user.type';
import type { UserStatus } from 'entities/manager/model/types/manager.type';
import { useManagerUsers } from 'entities/manager/model/hooks/useManagerQueries';
import {
  formatDateTime,
  USER_ROLE_LABEL,
  USER_STATUS_LABEL,
} from 'entities/manager/lib/labels';
import Section from 'shared/ui/Layout/Section';
import Loading from 'shared/ui/Loading/Loading';
import Button from 'shared/ui/Button/Button';
import { InputText } from 'shared/ui/Input/InputText';
import { InputSelect } from 'shared/ui/Input/InputSelect';
import Badge from 'shared/ui/Badge/Badge';
import {
  DataTable,
  EmptyMessage,
  FilterField,
  FilterRow,
  PageDesc,
  PageHeader,
  PageTitle,
  Pagination,
} from 'widgets/manager/admin.styled';

const AdminUsersPage = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [role, setRole] = useState<UserType | ''>('');
  const [status, setStatus] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(0);

  const { data, isLoading, isFetching } = useManagerUsers({
    keyword: searchKeyword || undefined,
    role: role || undefined,
    status: status || undefined,
    page,
    size: 10,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    setSearchKeyword(keyword.trim());
  };

  const statusBadge = (userStatus: UserStatus) =>
    userStatus === 'ACTIVE' ? 'success' : 'error';

  return (
    <>
      <PageHeader>
        <PageTitle>회원 관리</PageTitle>
        <PageDesc>회원 검색, 상세 조회, 정지·해제를 처리합니다.</PageDesc>
      </PageHeader>

      <Section title="회원 검색">
        <FilterRow as="form" onSubmit={handleSearch}>
          <FilterField style={{ maxWidth: 280, flex: 2 }}>
            <InputText
              label="이름 / 이메일"
              labelSize="xsmall"
              placeholder="검색어 입력"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </FilterField>
          <FilterField>
            <InputSelect
              label="역할"
              labelSize="xsmall"
              options={[
                { value: '', label: '전체' },
                { value: 'APPLICANT', label: '구직자' },
                { value: 'EMPLOYER', label: '고용주' },
                { value: 'MANAGER', label: '관리자' },
              ]}
              value={role}
              onChange={(e) => {
                setRole(e.target.value as UserType | '');
                setPage(0);
              }}
            />
          </FilterField>
          <FilterField>
            <InputSelect
              label="상태"
              labelSize="xsmall"
              options={[
                { value: '', label: '전체' },
                { value: 'ACTIVE', label: '정상' },
                { value: 'SUSPENDED', label: '정지' },
              ]}
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as UserStatus | '');
                setPage(0);
              }}
            />
          </FilterField>
          <Button type="submit" scheme="primary" buttonSize="medium" borderRadius="medium">
            검색
          </Button>
        </FilterRow>
      </Section>

      <Section title={`회원 목록${data ? ` (${data.totalElements}명)` : ''}`}>
        {(isLoading || isFetching) && <Loading />}
        {!isLoading && data && data.content.length === 0 && (
          <EmptyMessage>검색 결과가 없습니다.</EmptyMessage>
        )}
        {!isLoading && data && data.content.length > 0 && (
          <>
            <DataTable>
              <thead>
                <tr>
                  <th>이름</th>
                  <th>이메일</th>
                  <th>역할</th>
                  <th>상태</th>
                  <th>신고</th>
                  <th>가입일</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((user) => (
                  <tr key={user.id} onClick={() => navigate(`/admin/users/${user.id}`)}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{USER_ROLE_LABEL[user.role]}</td>
                    <td>
                      <Badge scheme={statusBadge(user.status)} fontSize="xsmall">
                        {USER_STATUS_LABEL[user.status]}
                      </Badge>
                    </td>
                    <td>{user.reportCount}</td>
                    <td>{formatDateTime(user.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </DataTable>

            <Pagination>
              <Button
                scheme="secondary"
                buttonSize="small"
                borderRadius="medium"
                disabled={data.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                이전
              </Button>
              <span>
                {data.number + 1} / {Math.max(data.totalPages, 1)}
              </span>
              <Button
                scheme="secondary"
                buttonSize="small"
                borderRadius="medium"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
              >
                다음
              </Button>
            </Pagination>
          </>
        )}
      </Section>
    </>
  );
};

export default AdminUsersPage;
