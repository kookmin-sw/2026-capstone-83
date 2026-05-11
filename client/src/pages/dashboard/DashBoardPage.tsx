
// import { useSearchParams } from 'react-router-dom';

import { useAuthStore } from 'entities/auth/model/store/authStore';
import WorkerDashBoardPage from './applicant/WorkerDashBoardPage';
import EmployerDashboardPage from './employer/EmployerDashBoardPage';

const DashBoardPage = () => {
  const { role } = useAuthStore();

  // role 값에 따른 조건부 렌더링
  if (role === 'APPLICANT') {
    return <WorkerDashBoardPage />;
  }

  if (role === 'EMPLOYER') {
    return <EmployerDashboardPage />;
  }

  return <div>잘못된 접근입니다.</div>;
}



export default DashBoardPage