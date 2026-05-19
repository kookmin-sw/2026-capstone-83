import { Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { shouldHideFooter } from 'app/config/routeHandle';
import Header from 'widgets/header/Header';
import Footer from 'widgets/footer/Footer';

const MainLayout = () => {
  const { pathname } = useLocation();
  const hideFooter = shouldHideFooter(pathname);
  const flushTop = pathname === '/';

  return (
    <LayoutWrapper>
      <Header />
      <Container $flushTop={flushTop}>
        <Outlet />
      </Container>
      {!hideFooter && <Footer />}
    </LayoutWrapper>
  );
};

const LayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const Container = styled.section<{ $flushTop?: boolean }>`
  width: 100%;
  max-width: 1280px;
  min-width: 280px;
  margin: 0 auto;
  padding: ${({ $flushTop }) => ($flushTop ? '0 3rem 3rem' : '3rem')};
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (${({ theme }) => theme.mediaQuery.tablet_small}) {
    padding: ${({ $flushTop }) => ($flushTop ? '0 1.5rem 2rem' : '2rem 1.5rem')};
  }

  @media (${({ theme }) => theme.mediaQuery.mobile}) {
    padding: ${({ $flushTop }) => ($flushTop ? '0 1rem 1.5rem' : '1.5rem 1rem')};
  }
`;

export default MainLayout;
