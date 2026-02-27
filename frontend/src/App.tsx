import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import type { AuthUser } from '@/api/auth'
import { StudentRegistrationForm } from '@/components/StudentRegistrationForm'
import { StudentsList } from '@/components/StudentsList'
import { MyProfile } from '@/components/MyProfile'
import { LoginForm } from '@/components/LoginForm'
import styles from './App.module.css'

type View = 'register' | 'students' | 'profile' | 'login'

function App() {
  const { user, isAuthenticated, logout, setUser, setToken } = useAuth()
  const [view, setView] = useState<View>('register')

  const handleLoginSuccess = (u: AuthUser, token: string) => {
    setUser(u)
    setToken(token)
    setView(u.role === 'admin' ? 'students' : 'profile')
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Pareeksha</h1>
        <p className={styles.tagline}>Student Registration</p>
        <nav className={styles.nav}>
          {!isAuthenticated && (
            <button
              type="button"
              className={styles.navLink + (view === 'register' ? ' ' + styles.navLinkActive : '')}
              onClick={() => setView('register')}
            >
              Register
            </button>
          )}
          {!isAuthenticated ? (
            <button
              type="button"
              className={styles.navLink + (view === 'login' ? ' ' + styles.navLinkActive : '')}
              onClick={() => setView('login')}
            >
              Login
            </button>
          ) : (
            <>
              {user?.role === 'admin' && (
                <button
                  type="button"
                  className={styles.navLink + (view === 'students' ? ' ' + styles.navLinkActive : '')}
                  onClick={() => setView('students')}
                >
                  All students
                </button>
              )}
              {user?.role === 'student' && (
                <button
                  type="button"
                  className={styles.navLink + (view === 'profile' ? ' ' + styles.navLinkActive : '')}
                  onClick={() => setView('profile')}
                >
                  My profile
                </button>
              )}
              <span className={styles.userEmail}>{user?.email}</span>
              <button type="button" className={styles.navLink} onClick={() => { logout(); setView('register') }}>
                Logout
              </button>
            </>
          )}
        </nav>
      </header>
      <main className={styles.main}>
        <div className={styles.card}>
          {view === 'register' && !isAuthenticated && <StudentRegistrationForm />}
          {view === 'students' && <StudentsList />}
          {view === 'profile' && <MyProfile />}
          {view === 'login' && <LoginForm onSuccess={handleLoginSuccess} />}
          {isAuthenticated && view === 'register' && (
            user?.role === 'admin' ? <StudentsList /> : <MyProfile />
          )}
        </div>
      </main>
    </div>
  )
}

export default App
