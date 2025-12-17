// AdminContentPage.jsx
import { AdminPage, ContentManagementTable } from "../components/admin";

const AdminContent = () => {
  return (
    <AdminPage
      title="Content Management"
      description="Create, edit, and organize lessons and modules"
    >
      <ContentManagementTable />
    </AdminPage>
  );
};

export default AdminContent;
