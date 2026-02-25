import { StudentRegistrationForm } from '@/components/StudentRegistrationForm'
import styles from './App.module.css'

function App() {
  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.logo}>Pareeksha</h1>
        <p className={styles.tagline}>Student Registration</p>
      </header>
      <main className={styles.main}>
        <div className={styles.card}>
          <StudentRegistrationForm />
        </div>
      </main>
    </div>
  )
}

export default App
