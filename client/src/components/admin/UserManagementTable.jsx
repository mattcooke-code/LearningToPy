import { useState, useEffect } from "react";
import { useNotification, adminApiClient } from "../../context";
import {
  XPAdjustmentModal,
  ProgressOverrideModal,
  UserDetailModal,
} from "../modals";
import {
  ChevronDown,
  ChevronUp,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Shield,
  ShieldOff,
  Trophy,
  XCircle,
  CheckCircle,
  UserX,
  UserCheck,
} from "lucide-react";
import { Spinner } from "../ui";

const UserManagementTable = ({ searchQuery = "" }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("descend");
  const [filters, setFilters] = useState({
    isBlocked: "",
    isAdmin: "",
    levelMin: "",
    levelMax: "",
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [showXPModal, setShowXPModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [actionMenu, setActionMenu] = useState(null);

  const { showToast } = useNotification();
  const limit = 20;

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: page,
        limit: limit,
        sort: `${sortOrder === "descend" ? "-" : ""}${sortField}`,
      });

      if (searchQuery) {
        params.append("query", searchQuery);
      }

      if (filters.isBlocked !== "") {
        params.append("isBlocked", filters.isBlocked);
      }
      if (filters.isAdmin !== "") {
        params.append("isAdmin", filters.isAdmin);
      }
      if (filters.levelMin) {
        params.append("levelMin", filters.levelMin);
      }
      if (filters.levelMax) {
        params.append("levelMax", filters.levelMax);
      }

      const response = await adminApiClient.get(`/users/search?${params}`);
      const { users = [], pagination = {} } = response.data;

      setUsers(users);
      setTotalPages(pagination.totalPages || 1);
    } catch (err) {
      console.error("User fetch error:", err);
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, sortField, sortOrder, filters, searchQuery]);

  const toggleAdminStatus = async (userId, currentlyAdmin, username) => {
    const reason = prompt(
      `Reason for ${
        currentlyAdmin ? "removing" : "granting"
      } admin priviledges for ${username}:`
    );

    if (!reason) {
      showToast("Reason is required", "error");
      return;
    }

    try {
      await adminApiClient.patch(`/users/${userId}/admin-status`, {
        makesAdmin: !currentlyAdmin,
        reason,
      });

      showToast(
        `Admin status for ${username} updated successfully.`,
        "success"
      );
      fetchUsers();
    } catch (err) {
      showToast("Failed to update admin status.", "error");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "ascend" ? "descend" : "ascend");
    } else {
      setSortField(field);
      setSortOrder("descend");
    }
  };

  const handleUserStatus = async (userId, action) => {
    try {
      const reason = prompt(`Reason for ${action} (optional)`);

      await adminApiClient.patch(`/users/${userId}/status`, {
        action,
        reason: reason || undefined,
      });

      showToast(`User ${action}ed successfully`, "success");
      fetchUsers();
    } catch (err) {
      showToast(`Failed to ${action} user`, "error");
    }
  };

  const handleXPAdjust = async (userId, xpChange, reason) => {
    try {
      await adminApiClient.patch(`/users/${userId}/xp`, {
        xpChange: parseInt(xpChange),
        reason,
      });

      showToast("XP adjusted successfully", "success");
      setShowXPModal(false);
      fetchUsers();
    } catch (err) {
      showToast("Failed to adjust XP", "error");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ChevronUp className="h-4 w-4 opacity-30" />;
    return sortOrder === "ascend" ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const columns = [
    { key: "username", label: "Username", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "level", label: "Level", sortable: true },
    { key: "xp", label: "XP", sortable: true },
    { key: "badges", label: "Badges", sortable: false },
    { key: "status", label: "Status", sortable: false },
    { key: "createdAt", label: "Joined", sortable: true },
    { key: "actions", label: "Actions", sortable: false },
  ];

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="font-medium">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-3">
          <select
            value={filters.isBlocked}
            onChange={(e) =>
              setFilters({ ...filters, isBlocked: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="">All Status</option>
            <option value="true">Blocked</option>
            <option value="false">Active</option>
          </select>

          <select
            value={filters.isAdmin}
            onChange={(e) =>
              setFilters({ ...filters, isAdmin: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          >
            <option value="">All Roles</option>
            <option value="true">Admin</option>
            <option value="false">User</option>
          </select>

          <input
            type="number"
            placeholder="Min Level"
            value={filters.levelMin}
            onChange={(e) =>
              setFilters({ ...filters, levelMin: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            min="1"
          />

          <input
            type="number"
            placeholder="Max Level"
            value={filters.levelMax}
            onChange={(e) =>
              setFilters({ ...filters, levelMax: e.target.value })
            }
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
            min="1"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  <button
                    onClick={() => column.sortable && handleSort(column.key)}
                    className={`flex items-center space-x-1 ${
                      column.sortable
                        ? "cursor-pointer hover:text-gray-700 dark:hover:text-gray-300"
                        : ""
                    }`}
                  >
                    <span>{column.label}</span>
                    {column.sortable && <SortIcon field={column.key} />}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
            {users.map((user) => (
              <tr
                key={user._id}
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 shrink-0">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="font-semibold text-blue-800 dark:text-blue-200">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.username}
                      </div>
                      {user.isAdmin && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {user.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white">
                    Level {user.level}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {user.xp?.toLocaleString()} XP
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex -space-x-2">
                    {user.badges?.slice(0, 3).map((badge, index) => (
                      <div
                        key={index}
                        className="h-8 w-8 rounded-full bg-yellow-100 dark:bg-yellow-900 border-2 border-white dark:border-gray-800 flex items-center justify-center"
                        title={badge}
                      >
                        <span className="text-xs">🏆</span>
                      </div>
                    ))}
                    {user.badges?.length > 3 && (
                      <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center">
                        <span className="text-xs">
                          +{user.badges.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.isBlocked
                        ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}
                  >
                    {user.isBlocked ? (
                      <>
                        <XCircle className="h-3 w-3 mr-1" />
                        Blocked
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </>
                    )}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActionMenu(actionMenu === user._id ? null : user._id)
                      }
                      className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      <MoreVertical className="h-5 w-5 text-gray-500" />
                    </button>

                    {actionMenu === user._id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Stop propagation
                              e.preventDefault();
                              setSelectedUser(user);
                              setShowDetailModal(true);
                              setActionMenu(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Eye className="h-4 w-4 mr-3" />
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Stop propagation
                              e.preventDefault();
                              setSelectedUser(user);
                              setShowXPModal(true);
                              setActionMenu(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Trophy className="h-4 w-4 mr-3" />
                            Adjust XP
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Stop propagation
                              e.preventDefault();
                              setSelectedUser(user);
                              setShowProgressModal(true);
                              setActionMenu(null);
                            }}
                            className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                            <Edit className="h-4 w-4 mr-3" />
                            Edit Progress
                          </button>
                          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                          {user.isBlocked ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Stop propagation
                                e.preventDefault();
                                handleUserStatus(user._id, "unblock");
                                setActionMenu(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20"
                            >
                              <UserCheck className="h-4 w-4 mr-3" />
                              Unblock User
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Stop propagation
                                e.preventDefault();
                                handleUserStatus(user._id, "block");
                                setActionMenu(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <UserX className="h-4 w-4 mr-3" />
                              Block User
                            </button>
                          )}
                          {user.isAdmin ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Stop propagation
                                e.preventDefault();
                                toggleAdminStatus(
                                  user._id,
                                  true,
                                  user.username
                                );
                                setActionMenu(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <ShieldOff className="h-4 w-4 mr-3" />
                              Remove Admin
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Stop propagation
                                e.preventDefault();
                                toggleAdminStatus(
                                  user._id,
                                  false,
                                  user.username
                                );
                                setActionMenu(null);
                              }}
                              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Shield className="h-4 w-4 mr-3" />
                              Make Admin
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{" "}
                <span className="font-medium">{(page - 1) * limit + 1}</span> to{" "}
                <span className="font-medium">
                  {Math.min(page * limit, users.length)}
                </span>{" "}
                of <span className="font-medium">{users.length}</span> users
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pageNum
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

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
            fetchUsers();
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
