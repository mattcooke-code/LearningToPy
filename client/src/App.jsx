import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useAuth, apiClient } from "./context";
import { Footer, Navbar, ProtectedRoute } from "./components/layout";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import LessonPage from "./pages/LessonPage";
import Login from "./pages/Login";
import ModuleLessonsPage from "./pages/ModuleLessonsPage";
import ModulesPage from "./pages/ModulesPage";
import Profile from "./pages/Profile";
import Register from "./pages/Register";

// Import Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminContentPage from "./pages/AdminContentPage";
import AdminFlagged from "./pages/AdminFlagged";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminSettings from "./pages/AdminSettings";

import { useCourseThemeUpdater } from "./hooks/useCourseThemeUpdater";

function App() {
  const { isAuthenticated } = useAuth();

  useCourseThemeUpdater(apiClient, isAuthenticated);

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex flex-col">
      <Navbar />
      <main className="grow">
        <Routes>
          {/* PUBLIC */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

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

          {/* ADMIN ROUTES */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/content"
            element={
              <ProtectedRoute>
                <AdminContentPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/flagged"
            element={
              <ProtectedRoute>
                <AdminFlagged />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute>
                <AdminSettings />
              </ProtectedRoute>
            }
          />

          {/* Admin detail routes */}
          <Route
            path="/admin/users/:userId"
            element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
