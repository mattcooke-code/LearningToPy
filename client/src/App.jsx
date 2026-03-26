//App.jsx
import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth } from "./context";
import {
  AdminGuard,
  AppLayout,
  Footer,
  Navbar,
  ProtectedRoute,
} from "./components/layout";
import Dashboard from "./pages/Dashboard";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Home from "./pages/Home";
import LessonPage from "./pages/LessonPage";
import Login from "./pages/Login";
import ModuleLessonsPage from "./pages/ModuleLessonsPage";
import ModulesPage from "./pages/ModulesPage";
import ModuleQuizPage from "./pages/ModuleQuizPage";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Import Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminContentPage from "./pages/AdminContentPage";
import AdminFlagged from "./pages/AdminFlagged";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";

import {
  useCourseThemeUpdater,
  useSessionTracker,
  usePageViewTracker,
} from "./hooks";
import { AdminLayout } from "./components/admin";

import ModalManager from "./modals/ModalManager";

function App() {
  useCourseThemeUpdater();

  const { isAuthenticated, apiClient } = useAuth();
  const { sessionId } = useSessionTracker(isAuthenticated);

  usePageViewTracker();

  useEffect(() => {
    if (apiClient && sessionId) {
      setupAnalyticsHeaders(apiClient, sessionId);
    }
  }, [apiClient, sessionId]);

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
    </div>
  );
}

export default App;
