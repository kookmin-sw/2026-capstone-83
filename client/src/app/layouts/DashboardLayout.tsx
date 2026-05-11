import { Outlet } from 'react-router-dom';
import Header from 'widgets/header/Header';
import DashboardSidebar from 'widgets/sidebar/DashboardSidebar';
import styled from 'styled-components';

const DashboardLayout = () => {
  return (
    <>
      <Header />
      <LayoutWrapper>
        <DashboardSidebar />
        <ContentArea>
          <Outlet />
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
`;

export default DashboardLayout;
