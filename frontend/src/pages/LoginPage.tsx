import { LoginForm } from '@/components/LoginForm'
import { useAuth } from '@/context/AuthContext'
import type { AuthUser } from '@/api/auth'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const { setUser, setToken } = useAuth()
  const navigate = useNavigate()

  const handleSuccess = (u: AuthUser, token: string) => {
    setUser(u)
    setToken(token)
    navigate(u.role === 'admin' ? '/students' : '/profile', { replace: true })
  }

  return <LoginForm onSuccess={handleSuccess} />
}
