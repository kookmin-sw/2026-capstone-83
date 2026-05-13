import { useAuthStore } from 'entities/auth/model/store/authStore';
import EmployerCalendarPage from '../employer/EmployerCalendarPage';
import ApplicantCalendarPage from '../applicant/ApplicantCalendarPage';

const CalendarPage = () => {
  const { role } = useAuthStore();

  if (role === 'EMPLOYER') return <EmployerCalendarPage />;
  if (role === 'APPLICANT') return <ApplicantCalendarPage />;

  return <div>잘못된 접근입니다.</div>;
};

export default CalendarPage;
