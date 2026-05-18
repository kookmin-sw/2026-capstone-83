import { Outlet } from 'react-router-dom';
import Header from 'widgets/header/Header';
import ManagerSidebar from 'widgets/manager/ManagerSidebar';
import styled from 'styled-components';

const ManagerLayout = () => {
  return (
    <>
      <Header />
      <LayoutWrapper>
        <ManagerSidebar />
        <ContentArea>
          <ContentInner>
            <Outlet />
          </ContentInner>
        </ContentArea>
      </LayoutWrapper>
    </>
  );
};

const LayoutWrapper = styled.div`
  display: flex;
  min-height: calc(100vh - 60px);
`;

const ContentArea = styled.main`
  flex: 1;
  padding: 32px 24px;
  background-color: ${({ theme }) => theme.color.background};
  overflow-y: auto;
  min-width: 0;
`;

const ContentInner = styled.div`
  max-width: 1280px;
  min-width: 320px;
  width: 100%;
  margin: 0 auto;
`;

export default ManagerLayout;
