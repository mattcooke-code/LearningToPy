//App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  AdminGuard,
  Footer,
  Navbar,
  ProtectedRoute,
} from "./components/layout";
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

import { useCourseThemeUpdater } from "./hooks";
import { AdminLayout } from "./components/admin";

function App() {
  useCourseThemeUpdater();

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
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
