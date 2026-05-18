import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { isAxiosError } from 'axios';
import { fetchMockSchedules } from 'entities/schedule/api/schedule.api';
import { fetchWorkerSchedule } from 'entities/application/api/application.api';
import type { Schedule, ApplicantSchedule } from 'entities/schedule/model/types/schedule.type';
import { useScheduleStore } from 'entities/schedule/model/store/scheduleStore';
import { ScheduleChip } from 'entities/schedule/ui/ScheduleChip';
import { BaseMonthlyCalendar } from 'widgets/calendar/BaseMonthlyCalendar';
import { ApplicantWeeklyCalendarCards } from './ApplicantWeeklyCalendarCards';
import Badge from 'shared/ui/Badge/Badge';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import type { ApplyStatus } from 'entities/jobPost/model/types/jobPost.type';
import type { BadgeScheme } from 'shared/types/theme';
import { USE_MOCK } from 'shared/config/env';

type ViewMode = 'monthly' | 'weekly';

const CALENDAR_APPLY_STATUS: Record<ApplyStatus, { label: string; scheme: BadgeScheme } | null> = {
  NONE: null,
  APPLYING: { label: '지원 중', scheme: 'primary' },
  SELECTED: { label: '승인 대기', scheme: 'neutral' },
  HIRED: { label: '채용 확정', scheme: 'success' },
  REJECTED: { label: '지원 종료', scheme: 'error' },
};

function parseWorkerScheduleResponse(data: unknown): Record<string, Schedule[]> {
  if (data === null || typeof data !== 'object') {
    throw new Error('일정 응답 형식이 올바르지 않습니다.');
  }
  if (!('schedules' in data)) {
    throw new Error('일정 응답에 schedules 필드가 없습니다.');
  }
  const { schedules } = data as { schedules: unknown };
  if (schedules === null || typeof schedules !== 'object' || Array.isArray(schedules)) {
    throw new Error('일정 schedules 형식이 올바르지 않습니다.');
  }
  return schedules as Record<string, Schedule[]>;
}

function getScheduleLoadErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    if (status === 401) return '로그인이 필요합니다. 다시 로그인해 주세요.';
    if (status === 403) return '일정을 조회할 권한이 없습니다.';
    if (status && status >= 500) return '서버 오류로 일정을 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.';
    const body = error.response?.data;
    if (typeof body === 'object' && body !== null && 'message' in body) {
      return String((body as { message: string }).message);
    }
    if (status) return `일정을 불러오지 못했습니다. (HTTP ${status})`;
    if (error.code === 'ERR_NETWORK') return '네트워크 오류로 일정을 불러오지 못했습니다.';
  }
  if (error instanceof Error) return error.message;
  return '일정을 불러오지 못했습니다.';
}

export const ApplicantCalendarWidget = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const schedules = useScheduleStore((s) => s.schedules);
  const setSchedules = useScheduleStore((s) => s.setSchedules);
  const setSelectedJobPostId = useScheduleStore((s) => s.setSelectedJobPostId);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      // 현재 월 기준 날짜 범위 계산
      const now = currentDate;
      const fromDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      const toDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      let realSchedules: Record<string, Schedule[]> = {};

      try {
        const real = await fetchWorkerSchedule(fromDate, toDate);
        realSchedules = parseWorkerScheduleResponse(real);
      } catch (error) {
        const message = getScheduleLoadErrorMessage(error);
        setLoadError(message);
        if (!USE_MOCK) {
          setSchedules({});
          setIsLoading(false);
          return;
        }
      }

      try {
        const mock = USE_MOCK ? await fetchMockSchedules() : null;
        const mockSchedules = (mock?.schedules || {}) as Record<string, Schedule[]>;
        const merged = { ...mockSchedules };
        for (const [date, items] of Object.entries(realSchedules)) {
          merged[date] = [...(merged[date] || []), ...items];
        }

        const loadedSchedules = USE_MOCK ? merged : realSchedules;
        setSchedules(loadedSchedules);

        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        const todaySchedules = loadedSchedules[todayStr];
        if (todaySchedules && todaySchedules.length > 0) {
          setSelectedJobPostId(todaySchedules[0].jobPostId);
        }
      } catch (error) {
        setLoadError(getScheduleLoadErrorMessage(error));
        setSchedules({});
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [setSelectedJobPostId, setSchedules, currentDate]);

  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'monthly') {
      next.setMonth(next.getMonth() - 1);
    } else {
      next.setDate(next.getDate() - 7);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'monthly') {
      next.setMonth(next.getMonth() + 1);
    } else {
      next.setDate(next.getDate() + 7);
    }
    setCurrentDate(next);
  };

  if (isLoading) return <Loading message="캘린더를 불러오는 중..." />;

  if (loadError && !USE_MOCK) {
    return (
      <S.Wrapper>
        <Empty message={loadError} />
      </S.Wrapper>
    );
  }

  return (
    <S.Wrapper>
      {loadError && USE_MOCK && <S.ErrorBanner role="alert">{loadError}</S.ErrorBanner>}
      {viewMode === 'monthly' ? (
        <BaseMonthlyCalendar
          schedules={schedules}
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          onNavigate={setCurrentDate}
          viewMode={viewMode}
          onViewChange={setViewMode}
          renderChip={(schedule, { isOtherMonth, fullDate }) => {
            const applicantSchedule = schedule as ApplicantSchedule;
            const statusInfo = CALENDAR_APPLY_STATUS[applicantSchedule.applyStatus || 'NONE'];

            return (
              <ScheduleChip
                schedule={schedule}
                badge={statusInfo ? (
                  <Badge scheme={statusInfo.scheme}>
                    {statusInfo.label}
                  </Badge>
                ) : null}
                onSelect={isOtherMonth ? () => {
                  const [y, m] = fullDate.split('-').map(Number);
                  setCurrentDate(new Date(y, m - 1, 1));
                } : undefined}
              />
            );
          }}
        />
      ) : (
        <ApplicantWeeklyCalendarCards
          schedules={schedules as Record<string, ApplicantSchedule[]>}
          currentDate={currentDate}
          onPrev={handlePrev}
          onNext={handleNext}
          viewMode={viewMode}
          onViewChange={setViewMode}
        />
      )}
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    padding: 32px;
    background-color: ${({ theme }) => theme.color.white};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
  `,
  ErrorBanner: styled.p`
    margin: 0 0 16px;
    padding: 12px 16px;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    background-color: ${({ theme }) => theme.color.error}14;
    color: ${({ theme }) => theme.color.error};
    font-size: ${({ theme }) => theme.fontSize.small};
    line-height: 1.5;
  `,
};
