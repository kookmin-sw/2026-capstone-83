import LoginPage from 'pages/auth/LoginPage';
import SignupPage from 'pages/auth/SignupPage';
import JobPostCreatePage from 'pages/JobPost/JobPostCreatePage';
import JobPostDetailPage from 'pages/JobPost/JobPostDetailPage';
import JobPostEditPage from 'pages/JobPost/JobPostEditPage';
import { JobPostListPage } from 'pages/JobPost/JobPostListPage';
import MainPage from 'pages/MainPage';
import TestPage from 'pages/Test/TestPage';
import { Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';
import ApplicantListPage from 'pages/Applicant/ApplicantListPage';
import DashBoardPage from 'pages/dashboard/DashBoardPage';
import ResumeListPage from 'pages/Resume/ResumeListPage';
import ResumeDetailPage from 'pages/Resume/ResumeDetailPage';
import ResumeFormPage from 'pages/Resume/ResumeFormPage';
import WorkplacePage from 'pages/dashboard/employer/WorkplacePage';
import TalentPoolPage from 'pages/dashboard/employer/TalentPoolPage';
import ResumeManagePage from 'pages/dashboard/applicant/ResumeManagePage';
import ApplicationsPage from 'pages/dashboard/applicant/ApplicationsPage';
import CalendarPage from 'pages/dashboard/common/CalendarPage';
import SettingsPage from 'pages/dashboard/common/SettingsPage';
import NotificationsPage from 'pages/dashboard/common/NotificationsPage';
import ManagerLayout from './layouts/ManagerLayout';
import ManagerGuard from './guards/ManagerGuard';
import AdminDashboardPage from 'pages/admin/AdminDashboardPage';
import AdminUsersPage from 'pages/admin/AdminUsersPage';
import AdminUserDetailPage from 'pages/admin/AdminUserDetailPage';
import AdminReportsPage from 'pages/admin/AdminReportsPage';
import AdminReportDetailPage from 'pages/admin/AdminReportDetailPage';


const Routers = () => {
  return (
    <Routes>
      {/* 헤더 + 푸터 레이아웃 */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<MainPage />} />

        <Route path="/jobposts" element={<JobPostListPage />} />
        <Route path="/jobpost/:id" element={<JobPostDetailPage />} />
        <Route path="/jobpost/:id/edit" element={<JobPostEditPage />} />
        <Route path="/jobpost/create" element={<JobPostCreatePage />} />

        <Route path='/applicants' element={<ApplicantListPage />} />

        <Route path="/resumes" element={<ResumeListPage />} />
        <Route path="/resume/:id" element={<ResumeDetailPage />} />
        <Route path="/resume/edit" element={<ResumeFormPage />} />
      </Route>

      {/* 대시보드 레이아웃 (헤더 + 사이드바) */}
      <Route element={<DashboardLayout />}>
        <Route path="/dashboard" element={<DashBoardPage />} />
        <Route path="/dashboard/workplace" element={<WorkplacePage />} />
        <Route path="/dashboard/calendar" element={<CalendarPage />} />
        <Route path="/dashboard/talent" element={<TalentPoolPage />} />
        <Route path="/dashboard/resume" element={<ResumeManagePage />} />
        <Route path="/dashboard/resume/edit" element={<ResumeFormPage />} />
        <Route path="/dashboard/applications" element={<ApplicationsPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
        <Route path="/dashboard/notifications" element={<NotificationsPage />} />
      </Route>

      {/* 인증 전용 레이아웃 (헤더 없음, 배경색 + 중앙 정렬) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      {/* 관리자 레이아웃 (ROLE_MANAGER) */}
      <Route element={<ManagerGuard />}>
        <Route element={<ManagerLayout />}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/users/:id" element={<AdminUserDetailPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/reports/:id" element={<AdminReportDetailPage />} />
        </Route>
      </Route>

      <Route path="/test" element={<TestPage />} />
    </Routes>
  );
};

export default Routers;
