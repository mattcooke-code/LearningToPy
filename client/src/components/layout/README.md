# Layout Components

App shell components — routing, authentication gating, navigation, and structural layout. These wrap every page in the application.

## Component Index

| Component        | Responsibility                                                                                                                                                                                                          | Used In                              |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| `AdminGuard`     | Redirects non-admin users away from `/admin/*` routes. Shows loading state while auth is resolving.                                                                                                                     | Admin route wrapper                  |
| `AppLayout`      | Top-level layout wrapper. Applies `dark` class for theme, renders `<Outlet />` for nested routes.                                                                                                                       | `App.jsx` route tree                 |
| `Footer`         | Site-wide footer with brand column, curriculum link, resources, community links, and bottom bar with copyright + legal links.                                                                                           | `App.jsx`                            |
| `Navbar`         | Top navigation bar. Theme-aware background (progress colour or Python blue). Desktop nav links + mobile hamburger menu with slide-down. Login/register or dashboard/learn/profile/admin/logout depending on auth state. | `App.jsx`                            |
| `ProtectedRoute` | Redirects unauthenticated users to `/login`. Shows `Spinner` while auth loading. Wraps all authenticated routes.                                                                                                        | Route definitions in `App.jsx`       |
| `ScrollToTop`    | Scrolls window to top on route change. Renders nothing (`null`).                                                                                                                                                        | `App.jsx` (mount once in route tree) |

## Dependency Graph

AdminGuard ─────────► context (useAuth, useNotification)
└─► react-router-dom (Navigate)
└─► components/ui (LoadingState)

AppLayout ─────────► context (useTheme)
└─► react-router-dom (Outlet)

Footer ────────────► react-router-dom (Link)

Navbar ────────────► context (useAuth, useTheme)
└─► react-router-dom (Link, useLocation)
└─► components/ui (ThemeToggle)
└─► utils (shouldUseThemeColor)
└─► constants/themeConstants
└─► lucide-react

ProtectedRoute ────► context (useAuth)
└─► react-router-dom (Navigate)
└─► components/ui (Spinner)

ScrollToTop ───────► react-router-dom (useLocation)
