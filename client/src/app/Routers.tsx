import LoginPage from 'pages/auth/LoginPage';
import SignupPage from 'pages/auth/SignupPage';
import JobPostCreatePage from 'pages/JobPost/JobPostCreatePage';
import JobPostDetailPage from 'pages/JobPost/JobPostDetailPage';
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


const Routers = () => {
  return (
    <Routes>
      {/* 헤더(+추후 푸터) 포함 레이아웃 */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<MainPage />} />

        <Route path="/jobposts" element={<JobPostListPage />} />
        <Route path="/jobpost/:id" element={<JobPostDetailPage />} />
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
        <Route path="/dashboard/applications" element={<ApplicationsPage />} />
        <Route path="/dashboard/settings" element={<SettingsPage />} />
      </Route>

      {/* 인증 전용 레이아웃 (헤더 없음, 배경색 + 중앙 정렬) */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>



      <Route path="/test" element={<TestPage />} />
    </Routes>
  );
};

export default Routers;
