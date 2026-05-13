import { useAuthStore } from 'entities/auth/model/store/authStore';
import EmployerSettingsPage from '../employer/EmployerSettingsPage';
import ApplicantSettingsPage from '../applicant/ApplicantSettingsPage';

const SettingsPage = () => {
  const { role } = useAuthStore();

  if (role === 'EMPLOYER') return <EmployerSettingsPage />;
  if (role === 'APPLICANT') return <ApplicantSettingsPage />;

  return <div>잘못된 접근입니다.</div>;
};

export default SettingsPage;
