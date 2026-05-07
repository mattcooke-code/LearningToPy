// AdminSettings.jsx
import { AdminSettingsPanel } from "../components/admin";

/**
 * Administrative settings page for platform configuration and system preferences.
 * 
 * This page provides administrators with access to platform-wide settings,
 * configuration options, and system preferences. Uses the AdminSettingsPanel
 * component for the main settings interface without additional page wrapper.
 * 
 * @component
 * @returns {JSX.Element} Administrative settings interface
 * 
 * @dependencies
 * - Requires AdminSettingsPanel for settings functionality
 * - Uses admin permissions for settings access control
 * - Integrates with various platform configuration systems
 */
const AdminSettings = () => {
  return <AdminSettingsPanel />;
};

export default AdminSettings;
