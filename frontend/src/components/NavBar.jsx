import { Link, useNavigate } from 'react-router-dom'
import { useNav } from '../contexts/NavContext'
import { useUser } from '../contexts/UserContext'

export default function NavBar() {
  const { crumbs } = useNav()
  const { user } = useUser()
  const navigate = useNavigate()

  return (
    <nav className="border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-4">
        {/* Left: logo + breadcrumbs */}
        <div className="flex items-center gap-2 min-w-0">
          <Link
            to="/dashboard"
            className="text-sm font-bold text-zinc-100 hover:text-white transition-colors flex-shrink-0"
          >
            VibeForge
          </Link>

          {crumbs.map((crumb, i) => (
            <div key={i} className="flex items-center gap-2 min-w-0">
              <svg className="w-3.5 h-3.5 text-zinc-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              {crumb.to ? (
                <Link
                  to={crumb.to}
                  className="text-sm text-zinc-400 hover:text-zinc-200 transition-colors truncate"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-sm text-zinc-300 truncate">
                  {crumb.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Right: settings */}
        <div className="flex items-center gap-3 flex-shrink-0">
          {user && (
            <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <span className="text-xs font-semibold text-indigo-300">
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </span>
            </div>
          )}
          <button
            onClick={() => navigate('/settings')}
            className="text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer p-1"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
