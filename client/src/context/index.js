// context/index.js

/**
 * @fileoverview Centralised exports for all context providers and hooks.
 *
 * @module context
 */
export { AuthProvider, useAuth } from "./AuthContext";
export { NotificationProvider, useNotification } from "./NotificationContext";
export { PythonProvider, usePython } from "./PythonContext";
export { ThemeProvider, useTheme } from "./ThemeContext";
