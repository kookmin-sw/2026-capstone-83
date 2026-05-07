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
import ApplicantListPage from 'pages/Applicant/ApplicantListPage';
import WorkDashBoardPage from 'pages/dashboard/WorkDashBoardPage';

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
        <Route path='/work/dashboard' element={<WorkDashBoardPage />} />
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
