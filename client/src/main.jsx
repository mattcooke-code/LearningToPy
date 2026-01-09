// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";
import { PythonProvider } from "./context/PythonContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollToTop />
      <NotificationProvider>
        <AuthProvider>
          <ThemeProvider>
            <PythonProvider>
              <App />
            </PythonProvider>
          </ThemeProvider>
        </AuthProvider>
      </NotificationProvider>
    </BrowserRouter>
  </React.StrictMode>
);
