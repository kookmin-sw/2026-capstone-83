
import styled from 'styled-components';

// import { JobPostSubmitCard } from 'features/jobPost'; // 제출 버튼 기능이 담긴 카드
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import type { JobPostCreate, JobPostCreateSubmit } from 'entities/jobPost/model/types/jobPost.type';
import { useWorkplaces } from 'entities/workplace/model/hooks/useWorkplace';
import { WorkplaceFilterBar } from 'features/workplace/WorkplaceFilterBar';
import { CreateWorkplaceModal } from 'features/workplace/CreateWorkplaceModal';
import Main from 'shared/ui/Layout/Main';
import Article from 'shared/ui/Layout/Article';
import { JobPostBasicInfoFields } from 'entities/jobPost/ui/InputFields/JobPostBasicInfoFields';
import { JobPostLocationField } from 'entities/jobPost/ui/InputFields/JobPostLocationField';
import { JobPostDescriptionField } from 'entities/jobPost/ui/InputFields/JobPostDescriptionField';
import { JobPostWorkContentFields } from 'entities/jobPost/ui/InputFields/JobPostWorkContentFields';
import { useImageUpload } from 'features/control-Image/hooks/useImageUpload';
import { ButtonGroup } from 'shared/ui/Input/InputStyle';
import { ImageUploadButton } from 'features/control-Image/UploadButton';
import { ImageRemoveButton } from 'features/control-Image/RemoveButton';
import { AddressSearchButton } from 'features/search-address/AddressSearchButton';
import { JobPostSubmitCard } from 'features/jobPost/create-jobPost/JobPostSubmitCard';
import { TemplateSection } from 'features/jobPost/create-jobPost/TemplateSection';
import type { JobPostTemplateResponse } from 'entities/jobPost/model/types/template.type';
import { useCreateJobPost } from 'features/jobPost/hooks/useCreateJobPost';
import { splitByComma } from 'shared/lib/transformString';
import { mergeJobPostRequirements, splitJobPostRequirements } from 'entities/jobPost/lib/jobPostRequirements';
import CreateJobPostButton from 'features/jobPost/create-jobPost/CreateJobPostButton';
import { useErrorAlertModal } from 'shared/lib/useErrorAlertModal';
import ErrorAlertModal from 'shared/ui/Modal/ErrorAlertModal';

export const JobPostCreateForm = () => {
  const [searchParams] = useSearchParams();
  const defaultWorkDate = searchParams.get('workDate') || '';
  const defaultWorkplaceId = searchParams.get('workplaceId');

  const { data: workplaces } = useWorkplaces();
  const [selectedWorkplaceId, setSelectedWorkplaceId] = useState<number | null>(
    defaultWorkplaceId ? Number(defaultWorkplaceId) : null
  );
  const [isCreateWpModalOpen, setIsCreateWpModalOpen] = useState(false);

  const { handleSubmit, register, setValue, watch, formState } = useForm<JobPostCreate>({
    defaultValues: {
      workDate: defaultWorkDate,
      requirementsText: '',
      certRequirements: [],
    },
  });
  const { mutate } = useCreateJobPost();
  const errorModal = useErrorAlertModal();

  // 작업장 선택 시 관련 필드 자동 채우기
  useEffect(() => {
    if (!workplaces || !selectedWorkplaceId) return;
    const wp = workplaces.find((w) => w.id === selectedWorkplaceId);
    if (wp) {
      setValue('workplaceId', wp.id);
      setValue('company', wp.companyName);
      setValue('location', wp.address);
    }
  }, [selectedWorkplaceId, workplaces, setValue]);

  // 첫 번째 작업장 자동 선택
  useEffect(() => {
    if (workplaces && workplaces.length > 0 && selectedWorkplaceId === null) {
      setSelectedWorkplaceId(workplaces[0].id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workplaces]);


  const onSubmit = (data: JobPostCreate) => {
    console.log('Submitting job post:', data);
    // 서버로 보내기 전 데이터 가공
    const { requirementsText, certRequirements, ...rest } = data;
    const requestBody: JobPostCreateSubmit = {
      ...rest,
      requirements: mergeJobPostRequirements(requirementsText, certRequirements),
      benefits: splitByComma(data.benefits),
      tasks: splitByComma(data.tasks),
      items: splitByComma(data.items),
    };

    console.log('가공된 데이터:', requestBody);
    mutate(requestBody, {
      onSuccess: (response) => {
        console.log('Job post created successfully:', response);
        // 페이지 이동 등
      },
      onError: errorModal.onMutationError('공고 등록에 실패했습니다.'),
    });
  };

  const {
    preview: logoPreview,
    fileInputRef,
    handleFileChange,
    clearFile,
    triggerUpload
  } = useImageUpload((file) => setValue('companyLogoImage', file));

  const {
    preview: descPreview,             // preview alias
    fileInputRef: descFileRef,
    handleFileChange: onDescFileChange,
    clearFile: onDescClear,
    triggerUpload: triggerDescUpload
  } = useImageUpload((file) => setValue('descriptionImage', file));

  // 템플릿 관련 헬퍼 함수
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
  };


  return (
    <Main>
      <Article>
        {/* 작업장 선택 바 */}
        {workplaces && workplaces.length > 0 && (
          <WorkplaceFilterBar
            workplaces={workplaces}
            selectedId={selectedWorkplaceId}
            onSelect={(id) => setSelectedWorkplaceId(id)}
            onCreateClick={() => setIsCreateWpModalOpen(true)}
            showAll={false}
          />
        )}

        {/* 태블릿: 템플릿 섹션 (데스크톱에서는 숨김) */}
        <MobileTemplateSection>
          <TemplateSection
            getFormValues={getTemplateFormValues}
            onLoadTemplate={handleLoadTemplate}
          />
        </MobileTemplateSection>

        <FormContainer onSubmit={handleSubmit(onSubmit)}>
          {/* 좌측: 엔티티들의 집합 */}
          <FieldsSection>
            <JobPostBasicInfoFields
              register={register}
              errors={formState.errors}
              previewUrl={logoPreview}
              imageActionSlot={
                <ButtonGroup style={{ flexDirection: 'row', width: 'auto' }}>
                  <ImageUploadButton
                    fileInputRef={fileInputRef}
                    onChange={handleFileChange}
                    triggerUpload={triggerUpload}
                  />
                  <ImageRemoveButton onDelete={clearFile} />
                </ButtonGroup>
              }
            />
            <JobPostWorkContentFields register={register} setValue={setValue} watch={watch} />
            <JobPostLocationField
              register={register}
              searchButtonSlot={
                <AddressSearchButton onAddressSelect={(address) => setValue('location', address)} />
              }
            />
            <JobPostDescriptionField
              register={register}
              previewUrl={descPreview}
              imageActionSlot={
                <div style={{ display: 'flex', gap: '4px' }}>
                  <ImageUploadButton
                    fileInputRef={descFileRef}
                    onChange={onDescFileChange}
                    triggerUpload={triggerDescUpload}
                  />
                  {descPreview && <ImageRemoveButton onDelete={onDescClear} />}
                </div>
              }
            />
            <SubmitBlockSection>
              <CreateJobPostButton />
            </SubmitBlockSection>
          </FieldsSection>

          {/* 우측: 스티키 피처 영역 */}
          <StickySection>
            <JobPostSubmitCard
              getFormValues={getTemplateFormValues}
              onLoadTemplate={handleLoadTemplate}
            />
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
  align-items: flex-start; /* 사이드바가 길어지지 않게 설정 */
`;

const FieldsSection = styled.div`
  flex: 1; /* 남은 공간 모두 차지 */
  display: flex;
  flex-direction: column;
`;

const StickySection = styled.aside`
  width: 320px;
  position: sticky;
  top: 100px; /* 상단 GNB 높이에 맞춰 조절 */
  
  @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
    display: none; /* 모바일이나 태블릿에선 하단 고정 바 형태로 변경 고려 */
  }
`;

const SubmitBlockSection = styled.div`
  display: none;
  @media (${({ theme }) => theme.mediaQuery.tablet_large}) {
    display: flex;
    flex-direction: column;
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
  }
`;
