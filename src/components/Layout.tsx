import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface LayoutProps {
  children: React.ReactNode
  title?: string
  rightActions?: React.ReactNode
}

export default function Layout({ children, title, rightActions }: LayoutProps) {
  const { profile } = useAuth()

  return (
    <div className="min-h-screen bg-[#f8f9fa] pb-40">
      <header className="bg-white/90 backdrop-blur-md text-[#24389c] font-semibold text-lg sticky top-0 z-50 border-b border-slate-100 shadow-sm flex justify-between items-center px-5 h-16 w-full">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full overflow-hidden bg-[#dee0ff] flex items-center justify-center">
            <span className="material-symbols-outlined text-[#24389c] text-[20px]">person</span>
          </div>
          <h1 className="text-[20px] font-semibold leading-7 text-[#24389c]">
            {title ?? (profile?.school?.name ?? 'HiTable')}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {rightActions ?? (
            <>
              <button className="p-2 rounded-full hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-[#757684]">search</span>
              </button>
              <button className="p-2 rounded-full hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-[#757684]">notifications</span>
              </button>
            </>
          )}
        </div>
      </header>

      <main className="px-5 pt-6 max-w-2xl mx-auto">
        {children}
      </main>

      <nav className="bg-white/95 backdrop-blur-lg fixed bottom-0 left-0 w-full flex justify-around items-center h-20 px-2 z-50 border-t border-slate-100 shadow-[0_-4px_12px_rgba(63,81,181,0.08)] rounded-t-2xl">
        <NavLink to="/" end className={({ isActive }) =>
          `flex flex-col items-center justify-center transition-colors ${isActive ? 'text-[#24389c]' : 'text-slate-400'}`
        }>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>home</span>
              <span className="text-[11px] font-medium">홈</span>
            </>
          )}
        </NavLink>
        <NavLink to="/subjects" className={({ isActive }) =>
          `flex flex-col items-center justify-center transition-colors ${isActive ? 'text-[#24389c] scale-105' : 'text-slate-400'}`
        }>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>search</span>
              <span className="text-[11px] font-medium">탐색</span>
            </>
          )}
        </NavLink>
        <NavLink to="/timetable" className={({ isActive }) =>
          `flex flex-col items-center justify-center transition-colors ${isActive ? 'text-[#24389c]' : 'text-slate-400'}`
        }>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>calendar_view_week</span>
              <span className="text-[11px] font-medium">시간표</span>
            </>
          )}
        </NavLink>
        <NavLink to="/community" className={({ isActive }) =>
          `flex flex-col items-center justify-center transition-colors ${isActive ? 'text-[#24389c]' : 'text-slate-400'}`
        }>
          {({ isActive }) => (
            <>
              <span className="material-symbols-outlined" style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}>forum</span>
              <span className="text-[11px] font-medium">커뮤니티</span>
            </>
          )}
        </NavLink>
      </nav>
    </div>
  )
}
