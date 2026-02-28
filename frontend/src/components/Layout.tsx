import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/components/Sidebar'

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
}

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-base layout-bg">
      {/* Mobile header */}
      <header className="lg:hidden flex items-center justify-between gap-4 px-4 py-3 bg-card border-b border-border shrink-0">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 -ml-2 rounded-lg text-muted hover:bg-input hover:text-text transition-colors touch-manipulation"
          aria-label="Open menu"
        >
          <MenuIcon className="w-6 h-6" />
        </button>
        <span className="font-bold text-lg tracking-tight text-text truncate">Pareeksha</span>
        <div className="w-10" aria-hidden />
      </header>

      {/* Sidebar: overlay on mobile, static on lg+ */}
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        className="fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-60 min-h-screen lg:min-h-0 bg-card border-r border-border flex flex-col shrink-0 transform lg:transform-none transition-transform duration-200 ease-out"
        overlayClassName="fixed inset-0 bg-black/50 z-40 lg:hidden"
        showOverlay={sidebarOpen}
        onOverlayClick={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <main className="relative flex-1 overflow-auto py-4 px-4 sm:py-6 sm:px-6 pb-12 w-full max-w-[900px] lg:mx-auto">
        <div className="bg-card border border-border rounded-[14px] p-4 sm:p-6 md:p-8 lg:p-10 shadow-card">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
