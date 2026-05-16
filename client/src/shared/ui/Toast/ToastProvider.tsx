import { Toaster } from 'react-hot-toast';

/**
 * 앱 전역 토스트 Provider
 * - toast.custom()으로 커스텀 컴포넌트를 렌더하므로 기본 스타일은 최소 설정
 * - App.tsx에서 한 번만 렌더
 */
const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      gutter={12}
      toastOptions={{
        duration: 4000,
      }}
    />
  );
};

export default ToastProvider;
