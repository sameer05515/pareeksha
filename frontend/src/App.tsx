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

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<HomeRedirect />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="students" element={<StudentsPage />} />
        <Route path="profile" element={<ProfilePage />} />
        <Route path="change-password" element={<ChangePasswordPage />} />
        <Route path="questions" element={<QuestionsPage />} />
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
