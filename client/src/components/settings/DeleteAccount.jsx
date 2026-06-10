// components/profile/DeleteAccount.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotification, useAuth } from "../../context";
import { apiClient } from "../../services";
import { getErrorMessage } from "../../utils";
import { LoadingState } from "../ui";

const DeleteAccount = ({ onBack }) => {
  const [step, setStep] = useState(1); // 1: warning, 2: confirmation text, 3: password
  const [password, setPassword] = useState("");
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { showToast } = useNotification();
  const { logout } = useAuth();

  const handleDelete = async () => {
    if (!password) {
      showToast("Please enter your password", "error");
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      await apiClient.delete("/auth/delete-account", {
        data: { password },
      });

      await logout("Your account has been permanently deleted.");

      // Navigate to goodbye/confirmation page
      navigate("/login", { replace: true });
    } catch (err) {
      showToast(getErrorMessage(err), "error");
      setLoading(false);
    }
  };

  const handleCancel = () => {
    onBack?.();
  };

  if (loading) {
    return <LoadingState message="Deleting account..." />;
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-xl font-semibold text-red-600 mb-4">
        Delete Account
      </h2>

      {step === 1 && (
        <>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-800 mb-2">
              ⚠️ This action cannot be undone
            </h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>Your account will be permanently deleted</li>
              <li>All progress and quiz results will be lost</li>
              <li>Exercise submissions will be removed</li>
              <li>This action is immediate and irreversible</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded 
                         hover:bg-red-700 transition-colors"
            >
              I understand, continue
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded 
                         hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {step === 2 && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            To confirm, type{" "}
            <strong className="text-red-600">DELETE MY ACCOUNT</strong> below:
          </p>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            className="w-full p-2 border rounded mb-6 focus:ring-2 focus:ring-red-500 
                       focus:border-red-500 font-mono"
            placeholder="DELETE MY ACCOUNT"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={() => setStep(3)}
              disabled={confirmText !== "DELETE MY ACCOUNT"}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded 
                         hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              Continue
            </button>
            <button
              onClick={handleCancel}
              className="flex-1 py-2 px-4 border border-gray-300 rounded 
                         hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <p className="text-sm text-gray-600 mb-4">
            Enter your password for final confirmation:
          </p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded mb-6 focus:ring-2 focus:ring-red-500 
                       focus:border-red-500"
            placeholder="Your password"
            autoFocus
          />
          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={!password || loading}
              className="flex-1 py-2 px-4 bg-red-600 text-white rounded 
                         hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed
                         transition-colors"
            >
              {loading ? "Deleting..." : "Permanently Delete My Account"}
            </button>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="flex-1 py-2 px-4 border border-gray-300 rounded 
                         hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DeleteAccount;
