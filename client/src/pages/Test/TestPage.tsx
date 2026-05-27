
import { JobPostCardCompare } from 'pages/Test/JobPostCardCompare';
import { showNotificationToast } from 'features/notification/showNotificationToast';
import type { NotificationType } from 'entities/notification/model/types/notification.type';
import Badge from 'shared/ui/Badge/Badge';
import Button from 'shared/ui/Button/Button';
import InputHeader from 'shared/ui/Input/InputHeader';
import { InputSelect } from 'shared/ui/Input/InputSelect';
import { InputSelectCustom } from 'shared/ui/Input/InputSelectCustom';
import { InputText } from 'shared/ui/Input/InputText';
import { InputTextarea } from 'shared/ui/Input/InputTextarea';
import ProgressBar from 'shared/ui/ProgressBar/ProgressBar';

import Title from 'shared/ui/Title/Title';
import styled from 'styled-components'

const TestPage = () => {

  const handleTestToast = (type: NotificationType) => {
    const messages: Record<NotificationType, string> = {
      NEW_APPLICATION: "김철수님이 '물류센터 분류 및 적재' 공고에 지원했습니다.",
      OFFER_RECEIVED: "워크브릿지 건설에서 채용 제안을 보냈습니다.",
      OFFER_ACCEPTED: "이영희님이 채용 제안을 승인했습니다.",
      HIRED: "채용이 확정되었습니다.",
      REJECTED: "지원이 거절되었습니다.",
      WORK_COMPLETED: "성수동 카페 작업이 완료되었습니다.",
      JOB_POST_DELETED: "채용 확정된 공고가 삭제되었습니다.",
      AUTO_MATCHED: "가용 시간에 맞는 새 공고가 자동 매칭되었습니다.",
    };
    showNotificationToast({
      id: Date.now(),
      type,
      message: messages[type],
      createdAt: new Date().toISOString(),
      isRead: false,
    });
  };

  return (
    <TestPageStyle>
      <h1>TestPage</h1>
      <h2>Buttons</h2>
      <Button
        scheme='primary'
        borderRadius='medium'
        buttonSize='medium'
        fontSize='medium'
        fontWeight='semibold'>
        Button
      </Button>

      <Button
        scheme='secondary'
        borderRadius='small'
        buttonSize='small'
        fontSize='small'>
        Button
      </Button>

      <h2>Inputs</h2>
      <InputText
        name='inputText'
        label='InputText'
        placeholder='InputText'
      />
      <InputTextarea
        name='inputTextarea'
        label='InputTextarea'
        placeholder='InputTextarea'
      />
      <InputSelect
        name='inputSelect'
        label='InputSelect'
        placeholder='InputSelect'
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ]}
      />
      <InputSelectCustom
        label='InputSelectCustom'
        placeholder='InputSelectCustom'
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
        ]}
      />


      <Title fontSize='large' color='primary'>
        Badges
      </Title>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Badge scheme='primary'>Primary</Badge>
        <Badge scheme='secondary'>Secondary</Badge>
        <Badge scheme='success'>Success</Badge>
      </div>
      <br /><br />


      <ProgressBar total={100} current={70} />

      <JobPostCardCompare />
      <br />

      <InputHeader title='근무내용' />
      <br />
      <br />

      <h2>Toast 알림 테스트</h2>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <Button scheme="primary" buttonSize="small" fontSize="xsmall" borderRadius="medium" onClick={() => handleTestToast('NEW_APPLICATION')}>
          지원 알림
        </Button>
        <Button scheme="primary" buttonSize="small" fontSize="xsmall" borderRadius="medium" onClick={() => handleTestToast('OFFER_ACCEPTED')}>
          승인 알림
        </Button>
        <Button scheme="primary" buttonSize="small" fontSize="xsmall" borderRadius="medium" onClick={() => handleTestToast('WORK_COMPLETED')}>
          작업 완료 알림
        </Button>
        <Button scheme="secondary" buttonSize="small" fontSize="xsmall" borderRadius="medium" onClick={() => handleTestToast('OFFER_RECEIVED')}>
          제안 알림
        </Button>
      </div>

    </TestPageStyle>


  )
}

const TestPageStyle = styled.div``;

export default TestPage