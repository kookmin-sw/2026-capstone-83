import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import Header from 'widgets/header/Header';

const MainLayout = () => {
  return (
    <>
      <Header />
      <Container>
        <Outlet />
      </Container>

      {/* 추후 Footer 추가 위치 */}
    </>
  );
};


const Container = styled.section`
  width: 100%;
  max-width: 1280px;
  min-width: 280px;
  margin: 0 auto;
  padding: 3rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;


export default MainLayout;
