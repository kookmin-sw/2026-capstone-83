import { useForm } from 'react-hook-form';
import styled from 'styled-components';
import { useResume } from 'entities/resume/model/hooks/useResume';
import { useUpdateResume } from 'entities/resume/model/hooks/useResume';
import { ResumeProfileSection } from 'entities/resume/ui/detailSections/ResumeProfileSection';
import { ResumeEducationFields } from 'entities/resume/ui/InputFields/ResumeEducationFields';
import { ResumeCareerFields } from 'entities/resume/ui/InputFields/ResumeCareerFields';
import type { ResumeRequest } from 'entities/resume/model/types/resume.type';
import Button from 'shared/ui/Button/Button';
import Main from 'shared/ui/Layout/Main';
import Article from 'shared/ui/Layout/Article';
import Loading from 'shared/ui/Loading/Loading';
import Empty from 'shared/ui/Empty/Empty';
import InputHeader from 'shared/ui/Input/InputHeader';

export const ResumeFormContent = () => {
  const { data: resume, isLoading, isError } = useResume();
  const { mutate: updateResume, isPending } = useUpdateResume();

  const { register, handleSubmit } = useForm<ResumeRequest>({
    values: resume ? {
      education: resume.education,
      educationStatus: resume.educationStatus,
      major: resume.major,
    } : undefined,
  });

  const onSubmit = (data: ResumeRequest) => {
    updateResume(data, {
      onSuccess: () => {
        alert('이력서가 저장되었습니다.');
      },
      onError: () => {
        alert('이력서 저장에 실패했습니다.');
      },
    });
  };

  if (isLoading) return <Loading message="이력서를 불러오는 중입니다..." />;
  if (isError || !resume) return <Empty message="이력서를 불러올 수 없습니다." />;

  return (
    <Main>
      <Article>
        {/* 1. 회원 정보 (읽기 전용) */}
        <ResumeProfileSection
          data={resume}
          actions={
            <Button scheme="secondary" buttonSize="small" disabled>
              회원 정보 수정
            </Button>
          }
        />

        {/* 2. 경력 폼 */}
        <S.FormSection>
          <InputHeader title="경력" titleSize="large" />

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* 학력 입력 */}
            <ResumeEducationFields register={register} />

            {/* 경력 사항 (별도 API로 CRUD) */}
            <S.CareerFieldsWrapper>
              <ResumeCareerFields careers={resume.careers || []} />
            </S.CareerFieldsWrapper>

            {/* 이력서 등록/저장 버튼 */}
            <S.SubmitWrapper>
              <Button
                type="submit"
                scheme="primary"
                buttonSize="smallMedium"
                disabled={isPending}
              >
                {isPending ? '저장 중...' : '+ 이력서 등록'}
              </Button>
            </S.SubmitWrapper>
          </form>
        </S.FormSection>
      </Article>
    </Main>
  );
};

const S = {
  FormSection: styled.section`
    padding: 40px;
    background: ${({ theme }) => theme.color.white};
    box-shadow: ${({ theme }) => theme.shadow.default};
    border-radius: ${({ theme }) => theme.borderRadius.medium};
    display: flex;
    flex-direction: column;
    gap: 24px;

    @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
      padding: 24px;
    }
  `,
  CareerFieldsWrapper: styled.div`
    margin-top: 32px;
  `,
  SubmitWrapper: styled.div`
    display: flex;
    justify-content: flex-end;
    margin-top: 32px;
  `,
};
