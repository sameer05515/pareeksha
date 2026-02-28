import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'block py-2.5 px-5 text-sm font-medium bg-indigo-500/10 text-accent border-l-[3px] border-accent'
    : 'block py-2.5 px-5 text-sm font-medium text-muted no-underline border-l-[3px] border-transparent transition-colors hover:bg-input hover:text-zinc-100'

export function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-card border-r border-border flex flex-col shrink-0">
      <div className="py-6 px-5 border-b border-border">
        <h1 className="text-[1.35rem] font-bold tracking-tight m-0 mb-1 bg-gradient-to-br from-zinc-100 to-zinc-400 bg-clip-text text-transparent">
          Pareeksha
        </h1>
        <p className="text-xs text-muted m-0">Student Registration</p>
      </div>
      <nav className="py-4 flex flex-col gap-1">
        {!isAuthenticated && (
          <>
            <NavLink to="/register" className={linkClass} end>Register</NavLink>
            <NavLink to="/login" className={linkClass} end>Login</NavLink>
          </>
        )}
        {isAuthenticated && (
          <>
            {user?.role === 'admin' && (
              <>
                <NavLink to="/students" className={linkClass} end>All students</NavLink>
                <NavLink to="/questions" className={linkClass} end>Questions</NavLink>
              </>
            )}
            {user?.role === 'student' && (
              <NavLink to="/profile" className={linkClass} end>My profile</NavLink>
            )}
            <NavLink to="/change-password" className={linkClass} end>Change password</NavLink>
            <div className="mt-auto pt-4 px-5 border-t border-border flex flex-col gap-2">
              <span className="text-xs text-muted break-all">{user?.email}</span>
              <button
                type="button"
                className="py-2 px-3 bg-transparent border border-border rounded text-sm text-muted text-left transition-colors hover:border-error hover:text-error"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}
