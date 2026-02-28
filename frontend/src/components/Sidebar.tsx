import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

function SunIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
    </svg>
  )
}

function MoonIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
    </svg>
  )
}

const linkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? 'block py-2.5 px-5 text-sm font-medium bg-indigo-500/10 text-accent border-l-[3px] border-accent'
    : 'block py-2.5 px-5 text-sm font-medium text-muted no-underline border-l-[3px] border-transparent transition-colors hover:bg-input hover:text-text'

export function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="w-60 min-h-screen bg-card border-r border-border flex flex-col shrink-0">
      <div className="py-6 px-5 border-b border-border">
        <h1 className="text-[1.35rem] font-bold tracking-tight m-0 mb-1 bg-gradient-to-br from-zinc-100 to-zinc-400 bg-clip-text text-transparent sidebar-logo">
          Pareeksha
        </h1>
        <p className="text-xs text-muted m-0">Student Registration</p>
        <button
          type="button"
          onClick={toggleTheme}
          className="mt-3 flex items-center gap-2 py-2 px-3 rounded border border-border text-muted text-sm hover:bg-input hover:text-text transition-colors"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? (
            <>
              <SunIcon className="w-4 h-4" />
              Light
            </>
          ) : (
            <>
              <MoonIcon className="w-4 h-4" />
              Dark
            </>
          )}
        </button>
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
                <NavLink to="/exam-schedules" className={linkClass} end>Exam schedule</NavLink>
              </>
            )}
            {user?.role === 'student' && (
              <>
                <NavLink to="/exams" className={linkClass} end>Upcoming exams</NavLink>
                <NavLink to="/profile" className={linkClass} end>My profile</NavLink>
              </>
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
