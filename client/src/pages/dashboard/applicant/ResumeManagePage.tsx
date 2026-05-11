import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { MyResumeContent } from 'widgets/resume/MyResume/ui/MyResumeContent';
import Button from 'shared/ui/Button/Button';
import { Pencil } from 'lucide-react';

const ResumeManagePage = () => {
  const navigate = useNavigate();

  return (
    <ResumeManagePageStyle>
      <S.Header>
        <div>
          <h1>이력서 관리</h1>
          <p>내 이력서를 확인하고 관리할 수 있습니다.</p>
        </div>
        <Button
          scheme="primary"
          buttonSize="smallMedium"
          onClick={() => navigate('/dashboard/resume/edit')}
        >
          <Pencil size={16} />
          이력서 수정
        </Button>
      </S.Header>
      <MyResumeContent />
    </ResumeManagePageStyle>
  );
};

const S = {
  Header: styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
  `,
};

const ResumeManagePageStyle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;

  h1 {
    font-size: ${({ theme }) => theme.fontSize.xlarge};
    font-weight: ${({ theme }) => theme.fontWeight.bold};
    margin-bottom: 8px;
  }
  p {
    color: ${({ theme }) => theme.color.subText};
    font-size: ${({ theme }) => theme.fontSize.small};
  }
`;

export default ResumeManagePage;
