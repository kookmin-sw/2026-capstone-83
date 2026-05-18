import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import type { Workplace, WorkplaceFormData } from 'entities/workplace/model/types/workplace.type';
import { useCreateWorkplace, useUpdateWorkplace } from 'entities/workplace/model/hooks/useWorkplace';
import { useImageUpload } from 'features/control-Image/hooks/useImageUpload';
import { ImageUploadButton } from 'features/control-Image/UploadButton';
import { ImageRemoveButton } from 'features/control-Image/RemoveButton';
import { AddressSearchButton } from 'features/search-address/AddressSearchButton';
import { InputText } from 'shared/ui/Input/InputText';
import Button from 'shared/ui/Button/Button';
import Modal from 'shared/ui/Modal/Modal';
import { ButtonGroup } from 'shared/ui/Input/InputStyle';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Workplace | null; // 수정 모드일 때 기존 데이터
}

export const CreateWorkplaceModal = ({ isOpen, onClose, initialData }: Props) => {
  const isEditMode = !!initialData;
  const { mutate: createMutate, isPending: isCreating } = useCreateWorkplace();
  const { mutate: updateMutate, isPending: isUpdating } = useUpdateWorkplace();
  const isPending = isCreating || isUpdating;

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const { register, handleSubmit, setValue, reset, formState: { errors } } =
    useForm<WorkplaceFormData>();

  // 수정 모드일 때 초기값 세팅
  useEffect(() => {
    if (isOpen && initialData) {
      setValue('name', initialData.name);
      setValue('companyName', initialData.companyName);
      setValue('businessNumber', initialData.businessNumber);
      setValue('address', initialData.address);
    } else if (isOpen && !initialData) {
      reset();
      setLogoFile(null);
    }
  }, [isOpen, initialData, setValue, reset]);

  const {
    preview,
    fileInputRef,
    handleFileChange,
    clearFile,
    triggerUpload,
  } = useImageUpload((file) => {
    setLogoFile(file);
  });

  const handleClearLogo = () => {
    clearFile();
    setLogoFile(null);
  };

  const onSubmit = (formData: WorkplaceFormData) => {
    const payload = {
      data: formData,
      companyLogoImage: logoFile ?? undefined,
    };

    if (isEditMode && initialData) {
      updateMutate(
        { ...payload, id: initialData.id },
        {
          onSuccess: () => {
            alert('작업장이 수정되었습니다.');
            reset();
            handleClearLogo();
            onClose();
          },
          onError: () => {
            alert('작업장 수정에 실패했습니다.');
          },
        }
      );
    } else {
      createMutate(payload, {
        onSuccess: () => {
          alert('작업장이 등록되었습니다.');
          reset();
          handleClearLogo();
          onClose();
        },
        onError: () => {
          alert('작업장 등록에 실패했습니다.');
        },
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      actions={
        <>
          <Button
            scheme="secondary"
            buttonSize="large"
            borderRadius="medium"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            scheme="primary"
            buttonSize="large"
            borderRadius="medium"
            onClick={handleSubmit(onSubmit)}
            disabled={isPending}
          >
            {isPending ? (isEditMode ? '수정 중...' : '등록 중...') : (isEditMode ? '수정하기' : '등록하기')}
          </Button>
        </>
      }
    >
      <S.FormContent>
        <S.Title>{isEditMode ? '작업장 수정' : '작업장 정보'}</S.Title>

        <InputText
          label="작업장 이름"
          labelSize="xsmall"
          placeholder="작업장 이름을 입력해주세요"
          required
          error={errors.name?.message}
          {...register('name', { required: '작업장 이름을 입력해주세요.' })}
        />

        <InputText
          label="회사명"
          labelSize="xsmall"
          placeholder="회사명을 입력해주세요"
          required
          error={errors.companyName?.message}
          {...register('companyName', { required: '회사명을 입력해주세요.' })}
        />

        <InputText
          label="사업자 등록 번호"
          labelSize="xsmall"
          placeholder="000-00-00000"
          error={errors.businessNumber?.message}
          {...register('businessNumber')}
        />

        <div>
          <InputText
            label="주소"
            labelSize="xsmall"
            placeholder="주소를 검색해주세요"
            required
            readOnly
            error={errors.address?.message}
            {...register('address', { required: '주소를 입력해주세요.' })}
          />
          <ButtonGroup>
            <AddressSearchButton
              onAddressSelect={(address) => setValue('address', address)}
            />
          </ButtonGroup>
        </div>

        <S.ImageSection>
          <S.ImageLabel>로고 이미지</S.ImageLabel>
          {(preview || initialData?.companyLogoUrl) && (
            <S.PreviewImage>
              <img src={preview || initialData?.companyLogoUrl} alt="로고 미리보기" />
            </S.PreviewImage>
          )}
          <ButtonGroup style={{ flexDirection: 'row', width: 'auto' }}>
            <ImageUploadButton
              fileInputRef={fileInputRef}
              onChange={handleFileChange}
              triggerUpload={triggerUpload}
            />
            {(preview || initialData?.companyLogoUrl) && (
              <ImageRemoveButton onDelete={handleClearLogo} />
            )}
          </ButtonGroup>
        </S.ImageSection>
      </S.FormContent>
    </Modal>
  );
};

const S = {
  FormContent: styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
  `,
  Title: styled.h2`
    font-size: ${({ theme }) => theme.fontSize.large};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    margin-bottom: 8px;
  `,
  ImageSection: styled.div`
    display: flex;
    flex-direction: column;
    gap: 12px;
  `,
  ImageLabel: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
  `,
  PreviewImage: styled.div`
    width: 240px;
    height: 160px;
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    overflow: hidden;
    img { width: 100%; height: 100%; object-fit: cover; }
  `,
};
