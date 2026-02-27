import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { ChangePasswordForm } from '@/components/ChangePasswordForm'

export function ChangePasswordPage() {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <ChangePasswordForm />
}
