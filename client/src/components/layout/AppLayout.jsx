// AppLayout.jsx
import { Outlet } from "react-router-dom";

/**
 * Main application layout wrapper - renders content only.
 * The main landmark and page structure are handled by App.jsx.
 *
 * @component
 * @returns {JSX.Element} Content outlet without additional landmarks
 */
const AppLayout = () => {
  return <Outlet />;
};

export default AppLayout;
