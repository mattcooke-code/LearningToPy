// UserManagmentTable.jsx
import { useState, useMemo } from "react";
import { useNotification, adminApiClient } from "../../context";
import { useAdminData, useAdminMutation } from "../../hooks";
import {
  XPAdjustmentModal,
  ProgressOverrideModal,
  UserDetailModal,
} from "../../modals";
import {
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Eye,
  Shield,
  ShieldOff,
  XCircle,
  CheckCircle,
  UserX,
  UserCheck,
} from "lucide-react";
import { LoadingState, Pagination } from "../ui";
import UserTableFilters from "./UserTableFilters";

const UserManagementTable = ({ searchQuery = "" }) => {
  const { showToast } = useNotification();
  const intialFilters = {
    isBlocked: "",
    isAdmin: "",
    levelMin: "",
    levelMax: "",
  };

  // 1. Table & Fetching State
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("descend");
  const [filters, setFilters] = useState(intialFilters);

  // 2. Data Fetching Hook
  const queryParams = useMemo(
    () => ({
      page,
      limit: 20,
      sort: `${sortOrder === "descend" ? "-" : ""}${sortField}`,
      query: searchQuery,
      ...filters,
    }),
    [page, sortField, sortOrder, searchQuery, filters]
  );

  const {
    data,
    loading,
    refetch: refresh,
  } = useAdminData(
    () => adminApiClient.get("/users/search", { params: queryParams }),
    [queryParams]
  );

  const users = data?.users || [];
  const totalPages = data?.pagination?.totalPages || 1;

  // 3. Mutation Hooks
  const { mutate: updateStatus } = useAdminMutation(
    (vars) => adminApiClient.patch(`/users/${vars.id}/status`, vars.body),
    { successResource: "User status" }
  );

  const { mutate: updateAdmin } = useAdminMutation(
    (vars) => adminApiClient.patch(`/users/${vars.id}/admin-status`, vars.body),
    { successResource: "Admin permissions" }
  );

  // 4. Modal & UI State
  const [selectedUser, setSelectedUser] = useState(null);
  const [showXPModal, setShowXPModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);

  // --- Handlers ---

  const handleToggleAdmin = async (user) => {
    const reason = prompt(
      `Reason for ${
        user.isAdmin ? "removing" : "granting"
      } admin privileges for ${user.username}:`
    );
    if (!reason) return;

    await updateAdmin({
      id: user._id,
      body: { makeAdmin: !user.isAdmin, reason },
    });
    setActionMenu(null);
    refresh();
  };

  const handleStatusChange = async (userId, action) => {
    const reason = prompt(`Reason for ${action} (optional):`);
    await updateStatus({
      id: userId,
      body: { action, reason: reason || undefined },
    });
    setActionMenu(null);
    refresh();
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
    } else {
      setSortField(field);
      setSortOrder("descend");
    }
    setPage(1); // Reset to page 1 on sort
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setPage(1);
  };

  if (loading && users.length === 0) {
    return <LoadingState message="Loading users..." height="h-96" />;
  }

  return (
    <div className="space-y-4">
      {/* Filters Block */}
      <UserTableFilters
        filters={filters}
        setFilters={setFilters}
        onReset={handleReset}
      />

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              {[
                "username",
                "email",
                "level",
                "xp",
                "status",
                "createdAt",
                "actions",
              ].map((col) => (
                <th
                  key={col}
                  className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  <button
                    onClick={() =>
                      col !== "actions" && col !== "status" && handleSort(col)
                    }
                    className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                  >
                    <span>{col}</span>
                    {sortField === col &&
                      (sortOrder === "ascend" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      ))}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors relative"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold mr-3">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </div>
                      {user.isAdmin && (
                        <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-bold uppercase">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </td>
                <td className="px-6 py-4 text-sm font-mono dark:text-gray-300">
                  Lvl {user.level}
                </td>
                <td className="px-6 py-4 text-sm dark:text-gray-300">
                  {user.xp?.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                      user.isBlocked
                        ? "bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        : "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    }`}
                  >
                    {user.isBlocked ? (
                      <XCircle className="w-3 h-3 mr-1" />
                    ) : (
                      <CheckCircle className="w-3 h-3 mr-1" />
                    )}
                    {user.isBlocked ? "Blocked" : "Active"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={() =>
                        setActionMenu(actionMenu === user._id ? null : user._id)
                      }
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors text-gray-500 dark:text-gray-400"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {actionMenu === user._id && (
                      <>
                        {/* Invisible backdrop to close menu */}
                        <div
                          className="fixed inset-0 z-[60]"
                          onClick={() => setActionMenu(null)}
                        />

                        {/* Action Menu Popover */}
                        <div className="absolute right-full top-0 mr-2 z-[70] w-48 bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 rounded-lg py-2 text-left animate-in fade-in zoom-in duration-100">
                          <button
                            className="w-full px-4 py-2 text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailModal(true);
                              setActionMenu(null);
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2 text-blue-500" /> View
                            Profile
                          </button>

                          <button
                            className="w-full px-4 py-2 text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 transition-colors"
                            onClick={() => handleToggleAdmin(user)}
                          >
                            {user.isAdmin ? (
                              <ShieldOff className="w-4 h-4 mr-2 text-orange-500" />
                            ) : (
                              <Shield className="w-4 h-4 mr-2 text-purple-500" />
                            )}
                            {user.isAdmin ? "Remove Admin" : "Make Admin"}
                          </button>

                          <div className="border-t border-gray-100 dark:border-gray-700 my-1" />

                          <button
                            className={`w-full px-4 py-2 text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              user.isBlocked
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                            }`}
                            onClick={() =>
                              handleStatusChange(
                                user._id,
                                user.isBlocked ? "unblock" : "block"
                              )
                            }
                          >
                            {user.isBlocked ? (
                              <UserCheck className="w-4 h-4 mr-2" />
                            ) : (
                              <UserX className="w-4 h-4 mr-2" />
                            )}
                            {user.isBlocked ? "Unblock User" : "Block User"}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination page={page} total={totalPages} onPageChange={setPage} />

      {/* Modals - NO portal wrapping needed, the modals handle it internally */}
      {showXPModal && selectedUser && (
        <XPAdjustmentModal
          user={selectedUser}
          onClose={() => setShowXPModal(false)}
          onSave={handleXPAdjust}
        />
      )}

      {showProgressModal && selectedUser && (
        <ProgressOverrideModal
          user={selectedUser}
          onClose={() => setShowProgressModal(false)}
          onSave={() => {
            showToast("Progress updated successfully", "success");
            setShowProgressModal(false);
            refresh();
          }}
        />
      )}

      {showDetailModal && selectedUser && (
        <UserDetailModal
          user={selectedUser}
          onClose={() => setShowDetailModal(false)}
        />
      )}
    </div>
  );
};

export default UserManagementTable;
