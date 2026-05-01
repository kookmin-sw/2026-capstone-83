import JobPostCreatePage from 'pages/JobPost/JobPostCreatePage'
import JobPostDetailPage from 'pages/JobPost/JobPostDetailPage'
import JobPostListPage from 'pages/JobPost/JobPostListPage'
import MainPage from 'pages/MainPage'
import TestPage from 'pages/Test/TestPage'
import { Route, Routes } from 'react-router-dom'

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/jobposts" element={<JobPostListPage />} />
      <Route path="/jobpost/:id" element={<JobPostDetailPage />} />
      <Route path="/jobpost/create" element={<JobPostCreatePage />} />

      <Route path="/test" element={<TestPage />} />
    </Routes>
  )
}



export default Routers