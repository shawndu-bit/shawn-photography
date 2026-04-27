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
  search: string
  navigate: (to: string, opts?: { replace?: boolean }) => void
}

const RouterContext = createContext<RouterContextValue | null>(null)
const ParamsContext = createContext<Record<string, string>>({})

function normalizePath(path: string) {
  if (!path) return '/'

  let pathname = path
  try {
    pathname = new URL(path, window.location.origin).pathname
  } catch {
    pathname = path
  }

  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname
}

function parseLocation(to: string) {
  try {
    const parsed = new URL(to, window.location.origin)
    const pathname = normalizePath(parsed.pathname)
    return { pathname, search: parsed.search || '' }
  } catch {
    const [rawPathname, rawSearch = ''] = to.split('?')
    const pathname = normalizePath(rawPathname || '/')
    return { pathname, search: rawSearch ? `?${rawSearch}` : '' }
  }
}

function matchPath(routePath: string, pathname: string) {
  if (routePath === '*') return { matched: true, params: {} as Record<string, string> }

  const routeSegments = normalizePath(routePath).split('/')
  const pathSegments = normalizePath(pathname).split('/')

  if (routeSegments.length !== pathSegments.length) return { matched: false, params: {} as Record<string, string> }

  const params: Record<string, string> = {}

  for (let i = 0; i < routeSegments.length; i += 1) {
    const routeSegment = routeSegments[i]
    const pathSegment = pathSegments[i]

    if (routeSegment.startsWith(':')) {
      params[routeSegment.slice(1)] = decodeURIComponent(pathSegment)
      continue
    }

    if (routeSegment !== pathSegment) return { matched: false, params: {} as Record<string, string> }
  }

  return { matched: true, params }
}

export function BrowserRouter({ children }: { children: ReactNode }) {
  const [locationState, setLocationState] = useState(() => parseLocation(window.location.pathname + window.location.search))

  useEffect(() => {
    const onPopState = () => setLocationState(parseLocation(window.location.pathname + window.location.search))
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const value = useMemo<RouterContextValue>(
    () => ({
      pathname: locationState.pathname,
      search: locationState.search,
      navigate(to, opts) {
        const target = parseLocation(to)
        if (target.pathname === locationState.pathname && target.search === locationState.search) return
        const href = `${target.pathname}${target.search}`
        if (opts?.replace) {
          window.history.replaceState({}, '', href)
        } else {
          window.history.pushState({}, '', href)
        }
        setLocationState(target)
      },
    }),
    [locationState.pathname, locationState.search],
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
  return { pathname: ctx.pathname, search: ctx.search }
}

export function useNavigate() {
  const ctx = useContext(RouterContext)
  if (!ctx) throw new Error('useNavigate must be used within BrowserRouter')
  return (to: string, opts?: { replace?: boolean }) => ctx.navigate(to, opts)
}

export function useParams() {
  return useContext(ParamsContext)
}

export function Route(_: { path: string; element: ReactElement }) {
  return null
}

export function Routes({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()

  const routeEntry = Children.toArray(children).find((child) => {
    if (!isValidElement(child)) return false
    const path = (child.props as { path?: string }).path
    if (typeof path !== 'string') return false
    return matchPath(path, pathname).matched
  }) as ReactElement<{ path: string; element: ReactElement }> | undefined

  if (!routeEntry) return null

  const params = matchPath(routeEntry.props.path, pathname).params
  return <ParamsContext.Provider value={params}>{routeEntry.props.element}</ParamsContext.Provider>
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
        if (/^(mailto:|tel:|https?:)/i.test(to)) return
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
