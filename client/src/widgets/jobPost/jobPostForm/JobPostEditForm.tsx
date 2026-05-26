import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import type { JobPostCreate, JobPostUpdateRequest } from 'entities/jobPost/model/types/jobPost.type';
import type { JobPostTemplateResponse } from 'entities/jobPost/model/types/template.type';
import { useJobPost } from 'entities/jobPost/model/hooks/useJobPost';
import { normalizeJobPostDate, normalizeJobPostTime } from 'entities/jobPost/lib/normalizeJobPostDate';
import { useWorkplaces } from 'entities/workplace/model/hooks/useWorkplace';
import { WorkplaceFilterBar } from 'features/workplace/WorkplaceFilterBar';
import { CreateWorkplaceModal } from 'features/workplace/CreateWorkplaceModal';
import { JobPostBasicInfoFields } from 'entities/jobPost/ui/InputFields/JobPostBasicInfoFields';
import { JobPostLocationField } from 'entities/jobPost/ui/InputFields/JobPostLocationField';
import { JobPostDescriptionField } from 'entities/jobPost/ui/InputFields/JobPostDescriptionField';
import { JobPostWorkContentFields } from 'entities/jobPost/ui/InputFields/JobPostWorkContentFields';
import { JobPostUrgentFields } from 'entities/jobPost/ui/InputFields/JobPostUrgentFields';
import { JobPostAutoOfferFields } from 'entities/jobPost/ui/InputFields/JobPostAutoOfferFields';
import { useImageUpload } from 'features/control-Image/hooks/useImageUpload';
import { ImageUploadButton } from 'features/control-Image/UploadButton';
import { ImageRemoveButton } from 'features/control-Image/RemoveButton';
import { AddressSearchButton } from 'features/search-address/AddressSearchButton';
import { JobPostSubmitCard } from 'features/jobPost/create-jobPost/JobPostSubmitCard';
import { TemplateSection } from 'features/jobPost/create-jobPost/TemplateSection';
import UpdateJobPostButton from 'features/jobPost/create-jobPost/UpdateJobPostButton';
import { useUpdateJobPostMutation } from 'features/jobPost/hooks/useUpdateJobPost';
import { splitByComma, joinByComma } from 'shared/lib/transformString';
import { mergeJobPostRequirements, splitJobPostRequirements } from 'entities/jobPost/lib/jobPostRequirements';
import Main from 'shared/ui/Layout/Main';
import Article from 'shared/ui/Layout/Article';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import Button from 'shared/ui/Button/Button';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';

interface Props {
  postId: number;
}

export const JobPostEditForm = ({ postId }: Props) => {
  const navigate = useNavigate();
  const { data: post, isLoading, isError } = useJobPost(postId);
  const { data: workplaces } = useWorkplaces();
  const { mutate, isPending } = useUpdateJobPostMutation();
  const errorModal = useErrorAlertModal();
  const [descriptionImage, setDescriptionImage] = useState<File | null>(null);
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(null);
  const [isCreateWpModalOpen, setIsCreateWpModalOpen] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  const { handleSubmit, register, setValue, watch, reset, formState } = useForm<JobPostCreate>();

  const {
    preview: descPreview,
    fileInputRef: descFileRef,
    handleFileChange: onDescFileChange,
    clearFile: onDescClear,
    triggerUpload: triggerDescUpload,
  } = useImageUpload((file) => setDescriptionImage(file));

  // 조회 데이터로 폼 초기화
  useEffect(() => {
    if (!post) return;

    const { requirementsText, certRequirements } = splitJobPostRequirements(post.requirements);

    reset({
      title: post.title,
      company: post.company,
      location: post.location,
      wage: post.wage,
      wageType: post.wageType,
      totalSlots: post.totalSlots,
      filledSlots: post.filledSlots,
      workDate: normalizeJobPostDate(post.workDate),
      workStart: normalizeJobPostTime(post.workStart),
      workEnd: normalizeJobPostTime(post.workEnd),
      deadline: normalizeJobPostDate(post.deadline),
      description: post.description,
      requirementsText,
      certRequirements,
      benefits: joinByComma(post.benefits),
      tasks: joinByComma(post.tasks),
      items: joinByComma(post.items),
      urgentEnabled: Boolean(post.urgentEnabled),
      urgentWageIncrease: post.urgentWageIncrease ?? undefined,
      autoOfferEnabled: Boolean(post.autoOfferEnabled),
    });
    setIsFormReady(true);
  }, [post, reset]);

  // 작업장 매칭 (표시용 — 수정 API에는 workplace 미포함)
  useEffect(() => {
    if (!workplaces || !post) return;
    const matched = workplaces.find(
      (wp) => wp.companyName === post.company || wp.address === post.location
    );
    if (matched) setSelectedWorkplaceId(matched.id);
  }, [workplaces, post]);

  useEffect(() => {
    if (!workplaces || !selectedWorkplaceId) return;
    const wp = workplaces.find((w) => w.id === selectedWorkplaceId);
    if (wp) {
      setValue('company', wp.companyName);
      setValue('location', wp.address);
    }
  }, [selectedWorkplaceId, workplaces, setValue]);

  const onSubmit = (data: JobPostCreate) => {
    if (!post) return;

    const updateData: JobPostUpdateRequest = {
      title: data.title,
      wage: Number(data.wage),
      wageType: data.wageType,
      workDate: data.workDate,
      workStart: data.workStart,
      workEnd: data.workEnd,
      totalSlots: Number(data.totalSlots),
      deadline: data.deadline,
      description: data.description,
      jobCategory: post.jobCategory,
      jobSubcategory: post.jobSubcategory,
      requirements: mergeJobPostRequirements(data.requirementsText, data.certRequirements),
      benefits: splitByComma(data.benefits),
      tasks: splitByComma(data.tasks),
      items: splitByComma(data.items),
      ageRequirements: post.ageRequirements,
      urgentEnabled: !!data.urgentEnabled,
      urgentWageIncrease: data.urgentEnabled ? Number(data.urgentWageIncrease) : null,
      autoOfferEnabled: !!data.autoOfferEnabled,
    };

    mutate(
      {
        id: postId,
        payload: {
          data: updateData,
          descriptionImage: descriptionImage ?? undefined,
        },
      },
      {
        onError: errorModal.onMutationError('공고 수정에 실패했습니다.'),
      },
    );
  };

  const getTemplateFormValues = () => {
    const values = watch();
    const requirements = mergeJobPostRequirements(
      values.requirementsText,
      values.certRequirements,
    );
    return {
      templateName: '',
      title: values.title,
      wage: values.wage,
      wageType: values.wageType,
      workStart: values.workStart,
      workEnd: values.workEnd,
      totalSlots: values.totalSlots,
      description: values.description,
      requirements: requirements.length ? requirements : undefined,
      benefits: splitByComma(values.benefits),
      tasks: splitByComma(values.tasks),
      items: splitByComma(values.items),
      urgentEnabled: !!values.urgentEnabled,
      urgentWageIncrease: values.urgentEnabled ? Number(values.urgentWageIncrease) : undefined,
      autoOfferEnabled: !!values.autoOfferEnabled,
    };
  };

  const handleLoadTemplate = (tpl: JobPostTemplateResponse) => {
    const { requirementsText, certRequirements } = splitJobPostRequirements(tpl.requirements);
    if (tpl.title) setValue('title', tpl.title);
    if (tpl.wage) setValue('wage', tpl.wage);
    if (tpl.wageType) setValue('wageType', tpl.wageType as JobPostCreate['wageType']);
    if (tpl.workStart) setValue('workStart', tpl.workStart);
    if (tpl.workEnd) setValue('workEnd', tpl.workEnd);
    if (tpl.totalSlots) setValue('totalSlots', tpl.totalSlots);
    if (tpl.description) setValue('description', tpl.description);
    setValue('requirementsText', requirementsText);
    setValue('certRequirements', certRequirements);
    if (tpl.benefits?.length) setValue('benefits', tpl.benefits.join(', '));
    if (tpl.tasks?.length) setValue('tasks', tpl.tasks.join(', '));
    if (tpl.items?.length) setValue('items', tpl.items.join(', '));
    setValue('urgentEnabled', Boolean(tpl.urgentEnabled));
    setValue('urgentWageIncrease', tpl.urgentEnabled ? tpl.urgentWageIncrease ?? undefined : undefined);
    setValue('autoOfferEnabled', Boolean(tpl.autoOfferEnabled));
  };

  if (isLoading || !isFormReady) return <Loading message="공고 정보를 불러오는 중..." />;
  if (isError || !post) return <Empty message="공고를 찾을 수 없습니다." />;

  const existingDescUrl = post.descriptionUrl || post.s3ContentUrl;
  const descPreviewUrl = descPreview || existingDescUrl;

  return (
    <Main>
      <Article>
        {workplaces && workplaces.length > 0 && (
          <WorkplaceFilterBar
            workplaces={workplaces}
            selectedId={selectedWorkplaceId}
            onSelect={setSelectedWorkplaceId}
            onCreateClick={() => setIsCreateWpModalOpen(true)}
            showAll={false}
          />
        )}

        <MobileTemplateSection>
          <TemplateSection
            getFormValues={getTemplateFormValues}
            onLoadTemplate={handleLoadTemplate}
          />
        </MobileTemplateSection>

        <FormContainer onSubmit={handleSubmit(onSubmit)}>
          <FieldsSection>
            <JobPostBasicInfoFields
              register={register}
              errors={formState.errors}
              previewUrl={post.companyLogoUrl}
            />
            <JobPostUrgentFields register={register} watch={watch} setValue={setValue} />
            <JobPostAutoOfferFields register={register} />
            <JobPostWorkContentFields register={register} setValue={setValue} watch={watch} />
            <JobPostLocationField
              register={register}
              searchButtonSlot={
                <AddressSearchButton onAddressSelect={(address) => setValue('location', address)} />
              }
            />
            <JobPostDescriptionField
              register={register}
              previewUrl={descPreviewUrl}
              imageActionSlot={
                <div style={{ display: 'flex', gap: '4px' }}>
                  <ImageUploadButton
                    fileInputRef={descFileRef}
                    onChange={onDescFileChange}
                    triggerUpload={triggerDescUpload}
                  />
                  {descPreviewUrl && <ImageRemoveButton onDelete={onDescClear} />}
                </div>
              }
            />
            <SubmitBlockSection>
              <UpdateJobPostButton isPending={isPending} />
              <Button
                type="button"
                scheme="secondary"
                buttonSize="smallMedium"
                style={{ width: '100%', marginTop: '8px' }}
                onClick={() => navigate(`/jobpost/${postId}`)}
              >
                취소
              </Button>
            </SubmitBlockSection>
          </FieldsSection>

          <StickySection>
            <JobPostSubmitCard
              getFormValues={getTemplateFormValues}
              onLoadTemplate={handleLoadTemplate}
              submitLabel={isPending ? '저장 중...' : '수정 완료'}
              isSubmitting={isPending}
            />
            <CancelButtonWrap>
              {/* <Button
                type="button"
                scheme="secondary"
                buttonSize="large"
                style={{ width: '100%' }}
                onClick={() => navigate(`/jobpost/${postId}`)}
              >
                취소
              </Button> */}
            </CancelButtonWrap>
          </StickySection>
        </FormContainer>
      </Article>

      <CreateWorkplaceModal
        isOpen={isCreateWpModalOpen}
        onClose={() => setIsCreateWpModalOpen(false)}
      />

      <ErrorAlertModal
        isOpen={errorModal.isOpen}
        message={errorModal.errorMessage}
        onClose={errorModal.close}
      />
    </Main>
  );
};

const FormContainer = styled.form`
  display: flex;
  gap: 40px;
  align-items: flex-start;
`;

const FieldsSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const StickySection = styled.aside`
  width: 320px;
  position: sticky;
  top: 100px;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
    display: none;
  }
`;

const CancelButtonWrap = styled.div`
  @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
    display: none;
  }
`;

const SubmitBlockSection = styled.div`
  display: none;
  flex-direction: column;
  gap: 8px;

  @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
    display: flex;
  }
`;

const MobileTemplateSection = styled.div`
  display: none;

  @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
    display: block;
    padding: 16px;
    background: ${({ theme }) => theme.color.white};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    box-shadow: ${({ theme }) => theme.shadow.default};
    margin-bottom: 16px;
  }
`;
