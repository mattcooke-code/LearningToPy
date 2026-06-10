// components/profile/ChangePassword.jsx
import { useState } from "react";
import { useNotification } from "../../context";
import { authApiClient } from "../../services";
import { getErrorMessage } from "../../utils";
import { LoadingState } from "../ui";

const ChangePassword = () => {
  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Lightweight client-side check — real validation is on the backend
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      showToast("All fields are required", "error");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }

    if (form.currentPassword === form.newPassword) {
      showToast(
        "New password must be different from current password",
        "error",
      );
      return;
    }

    setLoading(true);

    try {
      // ✅ Uses authApiClient — follows established pattern
      // authApiClient has baseURL = BACKEND_URL, so path is /api/auth/change-password
      await authApiClient.post("/api/auth/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      showToast("Password changed successfully!", "success");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      // ✅ Uses your existing error message utility
      showToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingState message="Changing password..." />;
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4">Change Password</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Current Password
          </label>
          <input
            type="password"
            value={form.currentPassword}
            onChange={(e) =>
              setForm({ ...form, currentPassword: e.target.value })
            }
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">New Password</label>
          <input
            type="password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
            autoComplete="new-password"
            disabled={loading}
          />
          <p className="text-xs text-gray-500 mt-1">
            At least 8 characters with uppercase, lowercase, number, and special
            character
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500
              ${
                form.confirmPassword &&
                form.newPassword !== form.confirmPassword
                  ? "border-red-500"
                  : ""
              }`}
            required
            autoComplete="new-password"
            disabled={loading}
          />
          {form.confirmPassword &&
            form.newPassword !== form.confirmPassword && (
              <p className="text-xs text-red-500 mt-1">
                Passwords do not match
              </p>
            )}
        </div>

        <button
          type="submit"
          disabled={
            loading ||
            !form.currentPassword ||
            !form.newPassword ||
            form.newPassword !== form.confirmPassword
          }
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Changing Password..." : "Change Password"}
        </button>
      </form>
    </div>
  );
};

export default ChangePassword;
