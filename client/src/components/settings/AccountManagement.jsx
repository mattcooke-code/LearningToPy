// components/settings/AccountManagement.jsx
import { ArrowLeft } from "lucide-react";
import ChangePassword from "./ChangePassword";
import DeleteAccount from "./DeleteAccount";
import ExportData from "./ExportData";

/**
 * Container component for account management sections.
 * Handles navigation between password change and account deletion views.
 *
 * @param {Object} props
 * @param {'password' | 'delete' | null} props.section - Which section to display
 * @param {Function} props.onBack - Callback to return to the account menu
 */
const AccountManagement = ({ section, onBack }) => {
  if (!section) return null;

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-sm text-gray-500 dark:text-gray-400 
                   hover:text-gray-700 dark:hover:text-gray-300 mb-4 transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Account Management
      </button>

      {section === "password" && <ChangePassword />}
      {section === "export" && <ExportData />}
      {section === "delete" && <DeleteAccount onBack={onBack} />}
    </div>
  );
};

export default AccountManagement;
