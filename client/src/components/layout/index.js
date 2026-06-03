/**
 * Layout components module exports.
 * Provides application layout, navigation, authentication guards, and utility components.
 *
 * @module layout
 * @exports {AdminGuard} - Route guard component that restricts access to admin-only routes
 * @exports {AppLayout} - Main application layout wrapper with theme support and responsive design
 * @exports {Footer} - Footer component with navigation links, resources, and brand information
 * @exports {Navbar} - Navigation bar component with theme-aware styling and mobile responsiveness
 * @exports {ProtectedRoute} - Route protection component that requires user authentication
 * @exports {ScrollToHashElement} - Component to smoothly scroll to page element using sticky nav (mobile only)
 * @exports {ScrollToTop} - Component that automatically scrolls to top when route changes
 */

export { default as AdminGuard } from "./AdminGuard";
export { default as AppLayout } from "./AppLayout";
export { default as Footer } from "./Footer";
export { default as Navbar } from "./Navbar";
export { default as ProtectedRoute } from "./ProtectedRoute";
export { default as ScrollToHashElement } from "./ScrollToHashElement";
export { default as ScrollToTop } from "./ScrollToTop";
export { default as StickyNavbar } from "./StickyNavbar";
