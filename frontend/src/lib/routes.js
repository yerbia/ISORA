// Browser-facing routes. The app uses a HashRouter, so these become the hash part of
// the URL (for example #/inicio). Keep the English aliases in App.jsx for old bookmarks,
// notifications and links shared before the Spanish routes were introduced.
export const ROUTES = Object.freeze({
  home: '/inicio',
  plan: '/plan',
  workout: '/entrenamiento',
  stats: '/estadisticas',
  history: '/historial',
  library: '/ejercicios',
  muscles: '/musculos',
  balance: '/equilibrio-estructural',
  photos: '/fotos-progreso',
  measurements: '/mediciones',
  settings: '/ajustes',
  checkin: '/check-in',
  coach: '/coach',
  admin: '/admin',
})

const ALIASES = [
  ['/home', ROUTES.home],
  ['/workout', ROUTES.workout],
  ['/stats', ROUTES.stats],
  ['/history', ROUTES.history],
  ['/library', ROUTES.library],
  ['/muscles', ROUTES.muscles],
  ['/structural-balance', ROUTES.balance],
  ['/progress-photos', ROUTES.photos],
  ['/measurements', ROUTES.measurements],
  ['/settings', ROUTES.settings],
  ['/checkin', ROUTES.checkin],
]

export function canonicalRoute(pathname) {
  const path = String(pathname || '') || '/'
  for (const [oldPath, newPath] of ALIASES) {
    if (path === oldPath) return newPath
    if (path.startsWith(oldPath + '/')) return newPath + path.slice(oldPath.length)
  }
  if (path.startsWith('/plan/r/')) return '/plan/rutina/' + path.slice('/plan/r/'.length)
  return path
}
