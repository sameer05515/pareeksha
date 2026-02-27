import { useState } from 'react'
import { StudentRegistrationForm } from '@/components/StudentRegistrationForm'
import { StudentsList } from '@/components/StudentsList'
import styles from './App.module.css'

type View = 'register' | 'students'

function App() {
  const [view, setView] = useState<View>('register')

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Pareeksha</h1>
        <p className={styles.tagline}>Student Registration</p>
        <nav className={styles.nav}>
          <button
            type="button"
            className={styles.navLink + (view === 'register' ? ' ' + styles.navLinkActive : '')}
            onClick={() => setView('register')}
          >
            Register
          </button>
          <button
            type="button"
            className={styles.navLink + (view === 'students' ? ' ' + styles.navLinkActive : '')}
            onClick={() => setView('students')}
          >
            All students
          </button>
        </nav>
      </header>
      <main className={styles.main}>
        <div className={styles.card}>
          {view === 'register' ? <StudentRegistrationForm /> : <StudentsList />}
        </div>
      </main>
    </div>
  )
}

export default App
