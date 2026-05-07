// AdminUsers.jsx
import { AdminPage, UserManagementTable } from "../components/admin";

/**
 * User management page for administrators to oversee and manage platform users.
 * 
 * This page provides comprehensive user administration capabilities including
 * user account management, XP adjustments, and account moderation. Uses the
 * UserManagementTable component for the main user interface with AdminPage
 * wrapper for consistent layout and navigation.
 * 
 * @component
 * @returns {JSX.Element} User management interface with user table and controls
 * 
 * @dependencies
 * - Requires AdminPage component for consistent admin layout
 * - Requires UserManagementTable for user management functionality
 * - Uses admin permissions for user management access
 * - Integrates with user data and authentication systems
 */
const AdminUsers = () => {
  return (
    <AdminPage
      title="User Management"
      description="Manage users, adjust XP, and moderate accounts"
    >
      <UserManagementTable />
    </AdminPage>
  );
};

export default AdminUsers;
