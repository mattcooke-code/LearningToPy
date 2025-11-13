// App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import LessonPage from "./pages/LessonPage";
import Login from "./pages/Login";
import ModuleLessonsPage from "./pages/ModuleLessonsPage";
import ModulesPage from "./pages/ModulesPage";
import Profile from "./pages/Profile";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";

function App() {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <AuthProvider>
          <Router>
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
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ThemeProvider>
  );
}

export default App;
