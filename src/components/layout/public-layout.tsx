import { Link, NavLink, Outlet } from "react-router-dom"
import { DemoBanner } from "@/components/shared/demo-banner"
import { LiveRegion } from "@/components/shared/live-region"
import { Button } from "@/components/ui/button"
import { LinkButton } from "@/components/shared/link-button"
import { LogoMark } from "@/components/brand/pixel-arrow"
import { routes } from "@/utils/routes"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { signedOut } from "@/store/authSlice"
import { cn } from "@/lib/cn"
import { LogOut, Plus } from "lucide-react"

const navClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    "px-3 py-2.5 text-[15px] text-ink",
    isActive
      ? "font-bold underline decoration-signal decoration-4 underline-offset-[10px]"
      : "font-medium no-underline hover:underline hover:decoration-ink hover:decoration-2 hover:underline-offset-[10px]",
  )

export function PublicLayout() {
  const dispatch = useAppDispatch()
  const { user, token } = useAppSelector((state) => state.auth)

  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-12 focus:left-3 focus:z-[60] focus:border-2 focus:border-ink focus:bg-signal focus:px-4 focus:py-2 focus:font-bold"
      >
        Skip to main content
      </a>

      <DemoBanner />

      <header className="sticky top-9 z-40 border-b-2 border-ink bg-paper">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Link to={routes.home} className="flex items-center gap-2.5 text-ink no-underline" aria-label="up-next home">
            <LogoMark />
            <span className="font-pixel text-2xl font-bold whitespace-nowrap">up-next</span>
          </Link>

          <nav aria-label="Main" className="order-last flex w-full gap-1 sm:order-none sm:w-auto sm:flex-1">
            <NavLink to={routes.browse} className={navClass}>
              Requests
            </NavLink>
            <NavLink to={routes.roadmap} className={navClass}>
              Roadmap
            </NavLink>
            {user?.role === "ADMIN" && (
              <NavLink to={routes.admin.board} className={navClass}>
                Admin board
              </NavLink>
            )}
          </nav>

          <div className="ml-auto flex items-center gap-2 sm:ml-0">
            {token && user ? (
              <>
                <span className="hidden font-mono text-[13px] text-ink-muted lg:inline">{user.displayName}</span>
                <Button size="sm" variant="ghost" onClick={() => dispatch(signedOut())} aria-label="Sign out">
                  <LogOut aria-hidden="true" className="size-4" />
                  <span className="hidden md:inline">Sign out</span>
                </Button>
              </>
            ) : (
              <>
                <LinkButton to={routes.auth.login} size="sm" variant="ghost">
                  Sign in
                </LinkButton>
                <LinkButton to={routes.auth.signup} size="sm" variant="secondary" className="hidden md:inline-flex">
                  Sign up
                </LinkButton>
              </>
            )}
            <LinkButton to={routes.submit} size="sm" variant="primary" className="border-2 border-ink font-bold">
              <Plus aria-hidden="true" className="size-4" strokeWidth={3} />
              <span className="max-[399px]:sr-only">Submit idea</span>
            </LinkButton>
          </div>
        </div>
      </header>

      <main id="main-content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="mt-auto border-t-2 border-ink">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-5 font-mono text-[12.5px] text-ink-muted">
          <span>up-next · demonstration build</span>
          <span>All data is fictional. One vote per person.</span>
        </div>
      </footer>

      <LiveRegion />
    </div>
  )
}
