import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'
import styles from './Layout.module.css'

export function Layout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.card}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
