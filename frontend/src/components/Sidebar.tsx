import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <h1 className={styles.logo}>Pareeksha</h1>
        <p className={styles.tagline}>Student Registration</p>
      </div>
      <nav className={styles.nav}>
        {!isAuthenticated && (
          <>
            <NavLink
              to="/register"
              className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
              end
            >
              Register
            </NavLink>
            <NavLink
              to="/login"
              className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
              end
            >
              Login
            </NavLink>
          </>
        )}
        {isAuthenticated && (
          <>
            {user?.role === 'admin' && (
              <>
                <NavLink
                  to="/students"
                  className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
                  end
                >
                  All students
                </NavLink>
                <NavLink
                  to="/questions"
                  className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
                  end
                >
                  Questions
                </NavLink>
              </>
            )}
            {user?.role === 'student' && (
              <NavLink
                to="/profile"
                className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
                end
              >
                My profile
              </NavLink>
            )}
            <NavLink
              to="/change-password"
              className={({ isActive }) => (isActive ? styles.linkActive : styles.link)}
              end
            >
              Change password
            </NavLink>
            <div className={styles.user}>
              <span className={styles.userEmail}>{user?.email}</span>
              <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
                Logout
              </button>
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}
