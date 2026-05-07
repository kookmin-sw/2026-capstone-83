import { worker } from "./browser";


export const startMockWorker = async () => {
  if (import.meta.env.VITE_USE_MSW === 'true' && import.meta.env.DEV) {
    await worker.start({
      onUnhandledRequest: 'bypass', // 백엔드로 요청 넘기기
      // 서비스 워커 관련 로그 출력을 최소화 (선택 사항)
      quiet: true,
    });
  }
};
