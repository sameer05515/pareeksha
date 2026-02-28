import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { Layout } from '@/components/Layout'
import { HomeRedirect } from '@/pages/HomeRedirect'
import { RegisterPage } from '@/pages/RegisterPage'
import { LoginPage } from '@/pages/LoginPage'
import { StudentsPage } from '@/pages/StudentsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { ChangePasswordPage } from '@/pages/ChangePasswordPage'
import { QuestionsPage } from '@/pages/QuestionsPage'
import { ExamSchedulesPage } from '@/pages/ExamSchedulesPage'
import { UpcomingExamsPage } from '@/pages/UpcomingExamsPage'
import { ExamAttemptPage } from '@/pages/ExamAttemptPage'
import { ExamResultPage } from '@/pages/ExamResultPage'
import { AttemptedExamsPage } from '@/pages/AttemptedExamsPage'
import { ScoreReportPage } from '@/pages/ScoreReportPage'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/exam/attempt" element={<ExamAttemptPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
        <Route path="questions" element={<QuestionsPage />} />
        <Route path="exam-schedules" element={<ExamSchedulesPage />} />
        <Route path="admin/score-report" element={<ScoreReportPage />} />
        <Route path="exams" element={<UpcomingExamsPage />} />
        <Route path="exams/attempted" element={<AttemptedExamsPage />} />
        <Route path="exam/result/:attemptId" element={<ExamResultPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
