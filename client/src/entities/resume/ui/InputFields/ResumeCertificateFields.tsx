import styled from 'styled-components';
import { useState } from 'react';
import type { CertificateType } from 'shared/types/certificate';
import type { CertificateResponse } from 'shared/types/certificate';
import { CERTIFICATE_LABEL } from 'shared/types/certificate';
import { useCreateCertificate, useDeleteCertificate } from '../../model/hooks/useResume';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import InputHeader from 'shared/ui/Input/InputHeader';
import Badge from 'shared/ui/Badge/Badge';
import { X } from 'lucide-react';

const ALL_TYPES: CertificateType[] = [
  'HEALTH_CERTIFICATE',
  'DRIVER_LICENSE',
  'OWN_CAR',
  'ID_CARD',
  'BANK_ACCOUNT_COPY',
  'RESUME_REQUIRED',
  'CRIMINAL_RECORD',
  'ALIEN_REGISTRATION',
];

interface Props {
  certificates: CertificateResponse[];
}

export const ResumeCertificateFields = ({ certificates }: Props) => {
  const [isAdding, setIsAdding] = useState(false);
  const [pendingTypes, setPendingTypes] = useState<CertificateType[]>([]);
  const { mutate: createCertificate } = useCreateCertificate();
  const { mutate: deleteCertificate } = useDeleteCertificate();
  const errorModal = useErrorAlertModal();

  // 이미 등록된 타입은 제외
  const availableTypes = ALL_TYPES.filter(
    (type) => !certificates.some((cert) => cert.type === type)
  );

  const handleAdd = (type: CertificateType) => {
    setPendingTypes((prev) => [...prev, type]);
    createCertificate(
      { type },
      {
        onSettled: () => {
          setTimeout(() => {
            setPendingTypes((prev) => prev.filter((t) => t !== type));
            setIsAdding(false);
          }, 300);
        },
        onError: errorModal.onMutationError('자격/인증 등록에 실패했습니다.'),
      },
    );
  };

  const handleDelete = (id: number) => {
    deleteCertificate(id, {
      onError: errorModal.onMutationError('자격/인증 삭제에 실패했습니다.'),
    });
  };

  return (
    <S.Wrapper>
      <InputHeader title="자격/인증" titleSize="large" />

      {/* 등록된 자격증 목록 + 추가/취소 버튼 (같은 줄) */}
      <S.CertRow>
        <S.CertList>
          {certificates.length > 0 ? (
            certificates.map((cert) => (
              <S.CertItem key={cert.id}>
                <Badge scheme="secondary">{CERTIFICATE_LABEL[cert.type]}</Badge>
                <S.DeleteButton onClick={() => handleDelete(cert.id)} aria-label="삭제">
                  <X size={14} />
                </S.DeleteButton>
              </S.CertItem>
            ))
          ) : (
            <S.EmptyText>등록된 자격/인증이 없습니다.</S.EmptyText>
          )}
        </S.CertList>

        {!isAdding ? (
          <Button
            type="button"
            scheme="secondary"
            buttonSize="xsmall"
            onClick={() => setIsAdding(true)}
            disabled={availableTypes.length === 0}
          >
            + 추가
          </Button>
        ) : (
          <Button
            type="button"
            scheme="secondary"
            buttonSize="xsmall"
            onClick={() => setIsAdding(false)}
          >
            취소
          </Button>
        )}
      </S.CertRow>

      {/* 선택 UI (isAdding일 때만) */}
      {isAdding && (
        <S.TypeGrid>
          {availableTypes.map((type) => {
            const isPending = pendingTypes.includes(type);
            return (
              <Button
                key={type}
                type="button"
                scheme={isPending ? 'optionActive' : 'option'}
                buttonSize="xsmall"
                fontSize="small"
                fontWeight="regular"
                onClick={() => handleAdd(type)}
                disabled={isPending}
              >
                {CERTIFICATE_LABEL[type]}
              </Button>
            );
          })}
        </S.TypeGrid>
      )}

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </S.Wrapper>
  );
};

const S = {
  Wrapper: styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
  `,
  CertRow: styled.div`
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
  `,
  CertList: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  `,
  CertItem: styled.div`
    display: flex;
    align-items: center;
    gap: 4px;
  `,
  DeleteButton: styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: ${({ theme }) => theme.color.subBackground};
    cursor: pointer;
    border: none;
    flex-shrink: 0;
    transition: background 0.15s ease;

    svg {
      color: ${({ theme }) => theme.color.subText};
      stroke: ${({ theme }) => theme.color.subText};
    }

    &:hover {
      background: ${({ theme }) => theme.color.error};

      svg {
        color: ${({ theme }) => theme.color.white};
        stroke: ${({ theme }) => theme.color.white};
      }
    }
  `,
  EmptyText: styled.p`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.subText};
  `,
  TypeGrid: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;

    button:not(:disabled):hover {
      background-color: ${({ theme }) => theme.color.primary};
      color: ${({ theme }) => theme.color.white};
    }
  `,
};
