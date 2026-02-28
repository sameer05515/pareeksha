import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'

export function Layout() {
  return (
    <div className="min-h-screen flex bg-base layout-bg">
      <Sidebar />
      <main className="relative flex-1 overflow-auto py-6 px-6 pb-12 max-w-[900px]">
        <div className="bg-card border border-border rounded-[14px] p-8 shadow-card sm:p-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
