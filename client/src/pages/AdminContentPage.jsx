// AdminContentPage.jsx
import { AdminPage, ContentManagementTable } from "../components/admin";

/**
 * Content management page for administrators to create, edit, and organize course content.
 * 
 * This page provides a centralized interface for managing lessons and modules with
 * full CRUD operations. Uses the ContentManagementTable component for the main
 * functionality and AdminPage wrapper for consistent layout and navigation.
 * 
 * @component
 * @returns {JSX.Element} Content management interface with table and controls
 * 
 * @dependencies
 * - Requires AdminPage component for consistent admin layout
 * - Requires ContentManagementTable for main functionality
 * - Uses admin permissions for content access control
 */
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
