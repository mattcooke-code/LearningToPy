// AdminSettings.jsx
import { AdminPage, AdminSettingsPanel } from "../components/admin";

const AdminSettings = () => {
  return (
    <AdminPage
      title="Platform Settings"
      description="Configure theme, gamification, and platform behavior"
      showHeader={false} // AdminSettingsPanel has its own header
    >
      <AdminSettingsPanel />
    </AdminPage>
  );
};

export default AdminSettings;
