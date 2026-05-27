import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import type { Workplace, WorkplaceFormData } from 'entities/workplace/model/types/workplace.type';
import { useCreateWorkplace, useUpdateWorkplace } from 'entities/workplace/model/hooks/useWorkplace';
import { useImageUpload } from 'features/control-Image/hooks/useImageUpload';
import { ImageUploadButton } from 'features/control-Image/UploadButton';
import { ImageRemoveButton } from 'features/control-Image/RemoveButton';
import { AddressSearchButton } from 'features/search-address/AddressSearchButton';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import { InputText } from 'shared/ui/Input/InputText';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import Button from 'shared/ui/Button/Button';
import Modal from 'shared/ui/Modal/Modal';
import { ButtonGroup } from 'shared/ui/Input/InputStyle';
import { DISTRICT_GROUPS } from 'entities/workerAvailability/model/constants/districts';

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
  const errorModal = useErrorAlertModal();

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [activeCity, setActiveCity] = useState<string | null>(null);
  const [showDistrictError, setShowDistrictError] = useState(false);

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } =
    useForm<WorkplaceFormData>({ defaultValues: { district: '' } });

  const selectedDistrict = watch('district');

  // 수정 모드일 때 초기값 세팅
  useEffect(() => {
    if (isOpen && initialData) {
      setValue('name', initialData.name);
      setValue('companyName', initialData.companyName);
      setValue('businessNumber', initialData.businessNumber);
      setValue('address', initialData.address);
      setValue('district', initialData.district ?? '');
    } else if (isOpen && !initialData) {
      reset();
      setLogoFile(null);
      setActiveCity(null);
      setShowDistrictError(false);
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

  const selectDistrict = (district: string) => {
    setValue('district', district);
    setShowDistrictError(false);
  };

  const clearDistrict = () => {
    setValue('district', '');
  };

  const onSubmit = (formData: WorkplaceFormData) => {
    if (!formData.district) {
      setShowDistrictError(true);
      return;
    }

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
          onError: errorModal.onMutationError('작업장 수정에 실패했습니다.'),
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
        onError: errorModal.onMutationError('작업장 등록에 실패했습니다.'),
      });
    }
  };

  return (
    <>
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

        {/* 사업장 행정구역 선택 */}
        <S.DistrictSection>
          <S.DistrictLabel>
            사업장 지역 <S.Required>*</S.Required>
          </S.DistrictLabel>

          {/* 선택된 지역 표시 */}
          {selectedDistrict ? (
            <S.SelectedTag>
              {selectedDistrict}
              <button type="button" onClick={clearDistrict} aria-label="지역 초기화">×</button>
            </S.SelectedTag>
          ) : (
            showDistrictError && (
              <S.ErrorText>사업장 지역을 선택해주세요.</S.ErrorText>
            )
          )}

          {/* 도시 탭 */}
          <S.CityTabs>
            {DISTRICT_GROUPS.map((g) => (
              <S.CityTab
                key={g.city}
                type="button"
                $active={activeCity === g.city}
                $hasSelected={selectedDistrict.startsWith(g.city)}
                onClick={() => setActiveCity(activeCity === g.city ? null : g.city)}
              >
                {g.city}
              </S.CityTab>
            ))}
          </S.CityTabs>

          {/* 구/군 칩 */}
          {activeCity && (
            <S.ChipGrid>
              {DISTRICT_GROUPS.find((g) => g.city === activeCity)?.districts.map((d) => {
                const label = d.replace(`${activeCity} `, '');
                return (
                  <S.Chip
                    key={d}
                    type="button"
                    $selected={selectedDistrict === d}
                    onClick={() => selectDistrict(d)}
                  >
                    {label}
                  </S.Chip>
                );
              })}
            </S.ChipGrid>
          )}
        </S.DistrictSection>

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

    <ErrorAlertModal
      isOpen={errorModal.isOpen}
      message={errorModal.errorMessage}
      onClose={errorModal.close}
    />
    </>
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
  DistrictSection: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
  `,
  DistrictLabel: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
  `,
  Required: styled.span`
    color: ${({ theme }) => theme.color.required};
    margin-left: 2px;
  `,
  SelectedTag: styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px 4px 12px;
    background: ${({ theme }) => theme.color.secondary};
    color: ${({ theme }) => theme.color.tertiary};
    border: 1px solid ${({ theme }) => theme.color.primary};
    border-radius: ${({ theme }) => theme.borderRadius.round};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    width: fit-content;

    button {
      background: none;
      border: none;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      color: ${({ theme }) => theme.color.tertiary};
      opacity: 0.7;
      padding: 0;
      &:hover { opacity: 1; }
    }
  `,
  ErrorText: styled.p`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.error};
    margin: 0;
  `,
  CityTabs: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  `,
  CityTab: styled.button<{ $active: boolean; $hasSelected: boolean }>`
    padding: 5px 12px;
    border-radius: ${({ theme }) => theme.borderRadius.round};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    ${({ $active, $hasSelected, theme }) =>
      $active
        ? `
          background: ${theme.color.primary};
          color: ${theme.color.white};
          border: 1px solid ${theme.color.primary};
        `
        : $hasSelected
          ? `
          background: ${theme.color.secondary};
          color: ${theme.color.tertiary};
          border: 1px solid ${theme.color.primary};
        `
          : `
          background: ${theme.color.white};
          color: ${theme.color.subText};
          border: 1px solid ${theme.color.border};
          &:hover {
            border-color: ${theme.color.primary};
            color: ${theme.color.primary};
          }
        `}
  `,
  ChipGrid: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    padding: 10px;
    background: ${({ theme }) => theme.color.background};
    border: 1px solid ${({ theme }) => theme.color.border};
    border-radius: 8px;
  `,
  Chip: styled.button<{ $selected: boolean }>`
    padding: 4px 10px;
    border-radius: ${({ theme }) => theme.borderRadius.round};
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;

    ${({ $selected, theme }) =>
      $selected
        ? `
          background: ${theme.color.primary};
          color: ${theme.color.white};
          border: 1px solid ${theme.color.primary};
          font-weight: ${theme.fontWeight.medium};
        `
        : `
          background: ${theme.color.white};
          color: ${theme.color.text};
          border: 1px solid ${theme.color.border};
          &:hover {
            border-color: ${theme.color.primary};
            color: ${theme.color.primary};
          }
        `}
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
