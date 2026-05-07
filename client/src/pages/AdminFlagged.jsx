// AdminFlagged.jsx
import { AdminPage, FlaggedContentList } from "../components/admin";

/**
 * Flagged content moderation page for reviewing and managing reported content.
 * 
 * This page provides administrators with tools to review, approve, or remove
 * flagged content and user reports. Uses the FlaggedContentList component for
 * the main moderation interface with AdminPage wrapper for consistent layout.
 * 
 * @component
 * @returns {JSX.Element} Content moderation interface with flagged items list
 * 
 * @dependencies
 * - Requires AdminPage component for consistent admin layout
 * - Requires FlaggedContentList for moderation functionality
 * - Uses admin permissions for content moderation access
 */
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
