// AdminUsers.jsx
import { AdminPage, UserManagementTable } from "../components/admin";

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
