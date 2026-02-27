import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function HomeRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (isAuthenticated) {
    return user?.role === 'admin' ? <Navigate to="/students" replace /> : <Navigate to="/profile" replace />
  }
  return <Navigate to="/register" replace />
}
