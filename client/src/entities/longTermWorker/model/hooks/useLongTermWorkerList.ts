import { useQuery } from '@tanstack/react-query';
import { fetchLongTermWorkers } from '../../api/longTermWorker.api';
import type { ResumeCardItem } from 'entities/resume/model/types/resume.type';

/** 장기근무로 등록한 구직자 목록 */
export const useLongTermWorkerList = (enabled = true) => {
  return useQuery<ResumeCardItem[]>({
    queryKey: ['longTermWorkers', 'list'],
    queryFn: fetchLongTermWorkers,
    enabled,
  });
};
