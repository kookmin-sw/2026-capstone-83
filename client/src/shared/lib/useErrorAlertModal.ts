import { useCallback, useState } from 'react';
import { getApiErrorMessage } from './getApiErrorMessage';

/** API mutation 실패 시 ErrorAlertModal 표시용 */
export const useErrorAlertModal = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const close = useCallback(() => setErrorMessage(null), []);

  const showError = useCallback((error: unknown, fallback: string) => {
    setErrorMessage(getApiErrorMessage(error, fallback));
  }, []);

  const onMutationError = useCallback(
    (fallback: string) => (error: unknown) => showError(error, fallback),
    [showError],
  );

  return {
    errorMessage: errorMessage ?? '',
    isOpen: errorMessage !== null,
    close,
    showError,
    onMutationError,
  };
};
