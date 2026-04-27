import JobPostDetailPage from 'pages/JobPost/JobPostDetailPage'
import JobPostListPage from 'pages/JobPost/JobPostListPage'
import MainPage from 'pages/MainPage'
import TestPage from 'pages/Test/TestPage'
import React from 'react'
import { Route, Routes } from 'react-router-dom'

const Routers = () => {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/jobposts" element={<JobPostListPage />} />
      <Route path="/jobpost/:id" element={<JobPostDetailPage />} />

      <Route path="/test" element={<TestPage />} />
    </Routes>
  )
}



export default Routers