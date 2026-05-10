import styled from 'styled-components';

const CalendarPage = () => {
  return (
    <CalendarPageStyle>
      <h1>캘린더</h1>
      <p>근무 일정을 확인할 수 있습니다.</p>
    </CalendarPageStyle>
  );
};

const CalendarPageStyle = styled.div`
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

export default CalendarPage;
