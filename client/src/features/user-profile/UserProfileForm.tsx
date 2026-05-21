import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import {
  formValuesToUpdateRequest,
  profileToFormValues,
  ROLE_LABEL,
} from 'entities/user/lib/profileFormMapper';
import {
  useMyProfile,
  useUpdateMyProfile,
} from 'entities/user/model/hooks/useUserProfile';
import type { Gender, UserProfileFormValues } from 'entities/user/model/types/userProfile.type';
import { ProfileImageUpload } from './ProfileImageUpload';
import { AddressSearchButton } from 'features/search-address/AddressSearchButton';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';
import Badge from 'shared/ui/Badge/Badge';
import Button from 'shared/ui/Button/Button';
import { InputText } from 'shared/ui/Input/InputText';
import { ButtonGroup } from 'shared/ui/Input/InputStyle';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';

const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: '남성' },
  { value: 'FEMALE', label: '여성' },
];

export const UserProfileForm = () => {
  const { data: profile, isLoading, isError } = useMyProfile();
  const { mutate: updateProfile, isPending } = useUpdateMyProfile();
  const errorModal = useErrorAlertModal();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<UserProfileFormValues>();

  const selectedGender = watch('gender');

  useEffect(() => {
    if (profile) reset(profileToFormValues(profile));
  }, [profile, reset]);

  const onSubmit = (values: UserProfileFormValues) => {
    updateProfile(formValuesToUpdateRequest(values), {
      onSuccess: () => {
        alert('회원정보가 저장되었습니다.');
      },
      onError: errorModal.onMutationError('회원정보 저장에 실패했습니다.'),
    });
  };

  if (isLoading) return <Loading message="회원정보를 불러오는 중..." />;
  if (isError || !profile) return <Empty message="회원정보를 불러올 수 없습니다." />;

  return (
    <>
    <S.Form onSubmit={handleSubmit(onSubmit)}>
      <ProfileImageUpload profileImageUrl={profile.profileImageUrl} name={profile.name} />

      <S.MetaRow>
        <S.MetaItem>
          <S.MetaLabel>이메일</S.MetaLabel>
          <S.MetaValue>{profile.email}</S.MetaValue>
        </S.MetaItem>
        <S.MetaItem>
          <S.MetaLabel>회원 유형</S.MetaLabel>
          <Badge scheme="primary">{ROLE_LABEL[profile.role]}</Badge>
        </S.MetaItem>
      </S.MetaRow>

      <S.Divider />

      <S.FieldGrid>
        <InputText
          label="이름"
          labelSize="small"
          placeholder="이름"
          required
          error={errors.name?.message}
          {...register('name', { required: '이름을 입력해주세요.' })}
        />

        <InputText
          label="생년월일"
          labelSize="small"
          type="date"
          required
          error={errors.birth?.message}
          {...register('birth', { required: '생년월일을 입력해주세요.' })}
        />

        <InputText
          label="전화번호"
          labelSize="small"
          placeholder="010-0000-0000"
          required
          error={errors.phone?.message}
          {...register('phone', { required: '전화번호를 입력해주세요.' })}
        />

        <S.GenderField>
          <S.GenderLabel>
            성별 <S.Required>*</S.Required>
          </S.GenderLabel>
          <ButtonGroup>
            {GENDER_OPTIONS.map(({ value, label }) => (
              <Button
                key={value}
                type="button"
                scheme={selectedGender === value ? 'optionActive' : 'option'}
                buttonSize="small"
                fontSize="small"
                borderRadius="round"
                onClick={() => setValue('gender', value, { shouldDirty: true })}
              >
                {label}
              </Button>
            ))}
          </ButtonGroup>
        </S.GenderField>

        <S.AddressRow>
          <InputText
            label="주소"
            labelSize="small"
            placeholder="주소를 검색해주세요"
            readOnly
            required
            error={errors.location?.message}
            {...register('location', { required: '주소를 입력해주세요.' })}
          />
          <S.AddressButtonWrap>
            <AddressSearchButton
              onAddressSelect={(address) => setValue('location', address, { shouldDirty: true })}
              buttonSize="small"
              fontSize="small"
            />
          </S.AddressButtonWrap>
        </S.AddressRow>
      </S.FieldGrid>

      <S.Actions>
        <Button
          type="button"
          scheme="secondary"
          buttonSize="smallMedium"
          onClick={() => reset(profileToFormValues(profile))}
          disabled={!isDirty || isPending}
        >
          되돌리기
        </Button>
        <Button type="submit" scheme="primary" buttonSize="smallMedium" disabled={isPending}>
          {isPending ? '저장 중...' : '저장하기'}
        </Button>
      </S.Actions>
    </S.Form>

    <ErrorAlertModal
      isOpen={errorModal.isOpen}
      message={errorModal.errorMessage}
      onClose={errorModal.close}
    />
    </>
  );
};

const S = {
  Form: styled.form`
    display: flex;
    flex-direction: column;
    gap: 24px;
  `,
  MetaRow: styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 24px 40px;
  `,
  MetaItem: styled.div`
    display: flex;
    flex-direction: column;
    gap: 6px;
  `,
  MetaLabel: styled.span`
    font-size: ${({ theme }) => theme.fontSize.xsmall};
    color: ${({ theme }) => theme.color.subText};
    font-weight: ${({ theme }) => theme.fontWeight.medium};
  `,
  MetaValue: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    color: ${({ theme }) => theme.color.text};
  `,
  Divider: styled.hr`
    border: none;
    border-top: 1px solid ${({ theme }) => theme.color.border};
    margin: 0;
  `,
  FieldGrid: styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      grid-template-columns: 1fr;
    }
  `,
  GenderField: styled.div`
    display: flex;
    flex-direction: column;
    gap: 8px;
    grid-column: 1 / -1;
  `,
  GenderLabel: styled.span`
    font-size: ${({ theme }) => theme.fontSize.small};
    font-weight: ${({ theme }) => theme.fontWeight.semibold};
    color: ${({ theme }) => theme.color.text};
  `,
  Required: styled.span`
    color: ${({ theme }) => theme.color.error};
    margin-left: 4px;
  `,
  AddressRow: styled.div`
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    align-items: end;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      grid-template-columns: 1fr;
    }
  `,
  AddressButtonWrap: styled.div`
    padding-bottom: 2px;
  `,
  Actions: styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 8px;
    border-top: 1px solid ${({ theme }) => theme.color.border};
  `,
};
