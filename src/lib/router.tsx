import {
  Children,
  createContext,
  isValidElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type AnchorHTMLAttributes,
  type ReactElement,
  type ReactNode,
} from 'react'

interface RouterContextValue {
  pathname: string
  navigate: (to: string, opts?: { replace?: boolean }) => void
}

const RouterContext = createContext<RouterContextValue | null>(null)

function normalizePath(path: string) {
  if (!path) return '/'
  if (path.length > 1 && path.endsWith('/')) return path.slice(0, -1)
  return path
}

function matchPath(routePath: string, pathname: string) {
  if (routePath === '*') return true
  if (routePath.endsWith('/*')) {
    const base = routePath.slice(0, -2)
    return pathname === base || pathname.startsWith(`${base}/`)
  }
  return routePath === pathname
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  const [pathname, setPathname] = useState(() => normalizePath(window.location.pathname))

  useEffect(() => {
    const onPopState = () => setPathname(normalizePath(window.location.pathname))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const value = useMemo<RouterContextValue>(
    () => ({
      pathname,
      navigate(to, opts) {
        const target = normalizePath(to)
        if (target === pathname) return
        if (opts?.replace) {
          window.history.replaceState({}, '', target)
        } else {
          window.history.pushState({}, '', target)
        }
        setPathname(target)
      },
    }),
    [pathname],
  )

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  )
}

export function useLocation() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useLocation must be used within BrowserRouter')
  return { pathname: ctx.pathname }
}

export function useNavigate() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useNavigate must be used within BrowserRouter')
  return (to: string, opts?: { replace?: boolean }) => ctx.navigate(to, opts)
}

export function Route(_: { path: string; element: ReactElement }) {
  return null
}

export function Routes({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  const route = Children.toArray(children).find((child) => {
    if (!isValidElement(child)) return false
    const path = (child.props as { path?: string }).path
    return typeof path === 'string' && matchPath(path, pathname)
  }) as ReactElement<{ element: ReactElement }> | undefined

  return route?.props.element ?? null
}

export function Navigate({ to, replace = false }: { to: string; replace?: boolean }) {
  const navigate = useNavigate()
  useEffect(() => {
    navigate(to, { replace })
  }, [navigate, replace, to])
  return null
}

type LinkClassName = string | ((args: { isActive: boolean }) => string)

interface LinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className'> {
  to: string
  className?: LinkClassName
  end?: boolean
}

function buildClassName(className: LinkClassName | undefined, isActive: boolean) {
  if (!className) return undefined
  return typeof className === 'function' ? className({ isActive }) : className
}

function useIsActive(to: string, end?: boolean) {
  const { pathname } = useLocation()
  const target = normalizePath(to)
  if (end) return pathname === target
  return pathname === target || pathname.startsWith(`${target}/`)
}

export function Link({ to, onClick, className, ...props }: LinkProps) {
  const navigate = useNavigate()
  const isActive = useIsActive(to, true)

  return (
    <a
      {...props}
      href={to}
      className={buildClassName(className, isActive)}
      onClick={(e) => {
        onClick?.(e)
        if (e.defaultPrevented) return
        if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
        e.preventDefault()
        navigate(to)
      }}
    />
  )
}

export function NavLink({ to, className, end, ...props }: LinkProps) {
  const isActive = useIsActive(to, end)
  return <Link to={to} className={buildClassName(className, isActive)} {...props} />
}
