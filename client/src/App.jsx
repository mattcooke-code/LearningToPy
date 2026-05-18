// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  AdminGuard,
  AppLayout,
  Footer,
  Navbar,
  ProtectedRoute,
} from "./components/layout";
import Curriculum from "./pages/Curriculum";
import Dashboard from "./pages/Dashboard";
import FAQ from "./pages/FAQ";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Home from "./pages/Home";
import LessonPage from "./pages/LessonPage";
import Login from "./pages/Login";
import ModuleLessonsPage from "./pages/ModuleLessonsPage";
import ModulesPage from "./pages/ModulesPage";
import ModuleQuizPage from "./pages/ModuleQuizPage";
import Privacy from "./pages/Privacy";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import Support from "./pages/Support";
import Terms from "./pages/terms";

// Import Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminContentPage from "./pages/AdminContentPage";
import AdminFlagged from "./pages/AdminFlagged";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";

import { useCourseThemeUpdater, usePageViewTracker } from "./hooks";
import { AdminLayout } from "./components/admin";
import { CookieNotice } from "./components/settings";

import ModalManager from "./modals/ModalManager";

function App() {
  useCourseThemeUpdater();
  usePageViewTracker();

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      <main className="grow">
        <Routes>
          {/* PUBLIC */}
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route path="/curriculum" element={<Curriculum />} />
            <Route path="/support" element={<Support />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />

            {/* PROTECTED */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/modules"
              element={
                <ProtectedRoute>
                  <ModulesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/modules/:moduleId/lessons"
              element={
                <ProtectedRoute>
                  <ModuleLessonsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/lessons/:id"
              element={
                <ProtectedRoute>
                  <LessonPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/modules/:moduleId/quiz"
              element={
                <ProtectedRoute>
                  <ModuleQuizPage />
                </ProtectedRoute>
              }
            />
            {/* ADMIN ROUTES */}
            <Route
              path="/admin/*"
              element={
                <AdminGuard>
                  <AdminLayout />
                </AdminGuard>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="users/:userId" element={<AdminUsers />} />
              <Route path="content" element={<AdminContentPage />} />
              <Route path="flagged" element={<AdminFlagged />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
          </Route>
        </Routes>
      </main>
      <Footer />

      <ModalManager />
      <CookieNotice />
    </div>
  );
}

export default App;
