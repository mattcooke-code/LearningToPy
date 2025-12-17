// AdminFlagged.jsx
import { AdminPage, FlaggedContentList } from "../components/admin";

const AdminFlagged = () => {
  return (
    <AdminPage
      title="Flagged Content"
      description="Review and moderate reported content and users"
    >
      <FlaggedContentList />
    </AdminPage>
  );
};

export default AdminFlagged;
