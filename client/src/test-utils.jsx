import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import { ThemeProvider } from "./context/ThemeContext.jsx";
import { NotificationProvider } from "./context/NotificationContext.jsx";

// Mock initial states
const defaultAuthValue = {
  user: { username: "TestUser", xp: 100, level: 5, streak: 2 },
  loading: false,
  isAuthenticated: true,
};

const defaultThemeValue = {
  themeColor: "#3776ab",
  updateThemeFromCourseProgress: vi.fn(),
};

const renderWithProviders = (
  ui,
  {
    authValue = defaultAuthValue,
    themeValue = defaultThemeValue,
    route = "/",
    ...renderOptions
  } = {},
) => {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      <NotificationProvider>
        <AuthProvider value={authValue}>
          <ThemeProvider value={themeValue}>{children}</ThemeProvider>
        </AuthProvider>
      </NotificationProvider>
    </MemoryRouter>
  );

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export * from "@testing-library/react";
export { renderWithProviders };
