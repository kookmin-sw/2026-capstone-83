
import { dummyJobPost } from 'entities/jobPost/ui/dummy';
import { JobPostCard } from 'entities/jobPost/ui/JobPostCard';


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

      <JobPostCard
        data={dummyJobPost}
      />
      <br />

      <InputHeader title='근무내용' />
      <br />
      <br />

    </TestPageStyle>


  )
}

const TestPageStyle = styled.div``;

export default TestPage