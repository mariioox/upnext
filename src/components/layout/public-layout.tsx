import { Link, Outlet, useLocation } from "react-router-dom"
import { DemoBanner } from "@/components/shared/demo-banner"
import { LiveRegion } from "@/components/shared/live-region"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/shared/link-button"
import { routes } from "@/utils/routes"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { signedOut } from "@/store/authSlice"
import { PlusCircle, LogOut, ShieldCheck, Flame, Compass, LogIn, UserPlus } from "lucide-react"

export function PublicLayout() {
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user, token } = useAppSelector((state) => state.auth)

  const isNavActive = (path: string) => {
    if (path === routes.home && location.pathname === "/") return true
    if (path !== routes.home && location.pathname.startsWith(path)) return true
    return false
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-md shadow-lg"
      >
        Skip to main content
      </a>

      <DemoBanner />

      <header className="border-b border-slate-200 bg-white sticky top-9 z-40 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link to={routes.home} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-xs group-hover:bg-blue-700 transition-colors">
                ↑
              </div>
              <span className="whitespace-nowrap font-bold text-lg tracking-tight text-slate-900">up-next</span>
            </Link>

            <nav className="hidden sm:flex items-center gap-1" aria-label="Main Navigation">
              <Link
                to={routes.browse}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isNavActive(routes.browse)
                    ? "bg-slate-100 text-blue-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  Requests
                </div>
              </Link>
              <Link
                to={routes.roadmap}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  isNavActive(routes.roadmap)
                    ? "bg-slate-100 text-blue-600 font-semibold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Compass className="w-4 h-4" />
                  Roadmap
                </div>
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            <LinkButton to={routes.submit} size="sm" variant="primary" className="shadow-xs">
                <PlusCircle aria-hidden="true" className="w-4 h-4" />
                <span className="max-[399px]:sr-only">Submit Idea</span>
              </LinkButton>

            {token && user ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-slate-200">
                {user.role === "ADMIN" && (
                  <LinkButton to={routes.admin.board} size="sm" variant="secondary" className="hidden md:inline-flex border-blue-200 text-blue-700 hover:bg-blue-50">
                      <ShieldCheck className="w-4 h-4 mr-1" />
                      Admin Board
                    </LinkButton>
                )}
                <span className="text-xs font-medium text-slate-600 hidden lg:inline">
                  {user.displayName}
                  {user.role === "ADMIN" && (
                    <span className="ml-1 text-[10px] uppercase font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                      Admin
                    </span>
                  )}
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => dispatch(signedOut())}
                  title="Sign out"
                  className="text-slate-500 hover:text-slate-900"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="sr-only">Sign out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1 ml-2">
                <LinkButton to={routes.auth.login} size="sm" variant="ghost">
                    <LogIn className="w-4 h-4 mr-1" />
                    Sign In
                  </LinkButton>
                <LinkButton to={routes.auth.signup} size="sm" variant="secondary" className="hidden sm:inline-flex">
                    <UserPlus className="w-4 h-4 mr-1" />
                    Sign Up
                  </LinkButton>
              </div>
            )}
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500 space-y-1">
          <p>up-next — Public feature request board and product roadmap.</p>
          <p className="text-slate-500">All data is fictional demonstration data. One vote per user strictly enforced.</p>
        </div>
      </footer>

      <LiveRegion />
    </div>
  )
}
