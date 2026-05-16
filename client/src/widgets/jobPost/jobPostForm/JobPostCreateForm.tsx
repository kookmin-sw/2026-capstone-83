
import styled from 'styled-components';

// import { JobPostSubmitCard } from 'features/jobPost'; // 제출 버튼 기능이 담긴 카드
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import type { JobPostCreate } from 'entities/jobPost/model/types/jobPost.type';
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
import { splitByComma } from 'shared/lib/transformString';
import { useCreateJobPost } from 'features/jobPost/hooks/useCreateJobPost';
import CreateJobPostButton from 'features/jobPost/create-jobPost/CreateJobPostButton';

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
      requirements: [],
    },
  });
  const { mutate } = useCreateJobPost();

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
    const requestBody = {
      ...data,
      requirements: splitByComma(data.requirements),
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
      onError: (error) => {
        console.error('Error creating job post:', error);
      }
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
            {/* <JobPostSubmitCard
              onSave={methods.handleSubmit(onSave)}
              onTemporarySave={onTemporarySave}
            /> */}
            <CreateJobPostButton />
          </StickySection>

        </FormContainer>
      </Article>

      <CreateWorkplaceModal
        isOpen={isCreateWpModalOpen}
        onClose={() => setIsCreateWpModalOpen(false)}
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
