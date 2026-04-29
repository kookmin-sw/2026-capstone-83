
import styled from 'styled-components';

// import { JobPostSubmitCard } from 'features/jobPost'; // 제출 버튼 기능이 담긴 카드
import { useForm } from 'react-hook-form';
import type { JobPostCreate } from 'entities/jobPost/model/types/jobPost.type';
import Main from 'shared/ui/Layout/Main';
import Article from 'shared/ui/Layout/Article';
import { JobPostBasicInfoFields } from 'entities/jobPost/ui/InputFields/JobPostBasicInfoFields';
import { createMockJobPost } from 'entities/jobPost/api/jobPost.api';
import { JobPostLocationField } from 'entities/jobPost/ui/InputFields/JobPostLocationField';
import { JobPostDescriptionField } from 'entities/jobPost/ui/InputFields/JobPostDescriptionField';
import { JobPostWorkContentFields } from 'entities/jobPost/ui/InputFields/JobPostWorkContentFields';
import { useImageUpload } from 'features/control-Image/hooks/useImageUpload';
import { ButtonGroup } from 'shared/ui/Input/InputStyle';
import { ImageUploadButton } from 'features/control-Image/UploadButton';
import { ImageRemoveButton } from 'features/control-Image/RemoveButton';
import { AddressSearchButton } from 'features/search-address/AddressSearchButton';
import { splitByComma } from 'shared/lib/transformString';
import Button from 'shared/ui/Button/Button';

export const JobPostCreateForm = () => {
  const { handleSubmit, register, setValue, formState } = useForm<JobPostCreate>(); // 폼 상태 관리


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
    createMockJobPost(requestBody)
      .then((response) => {
        console.log('Job post created successfully:', response);
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
            <JobPostWorkContentFields register={register} />
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
              <Button type="submit" scheme="primary" buttonSize="smallMedium" style={{ width: '100%' }}>
                공고 등록
              </Button>
            </SubmitBlockSection>
          </FieldsSection>

          {/* 우측: 스티키 피처 영역 */}
          <StickySection>
            {/* <JobPostSubmitCard
              onSave={methods.handleSubmit(onSave)}
              onTemporarySave={onTemporarySave}
            /> */}
            <Button type="submit" scheme="primary" buttonSize="smallMedium" style={{ width: '100%' }}>
              공고 등록
            </Button>
          </StickySection>

        </FormContainer>
      </Article>
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
