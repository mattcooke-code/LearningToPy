// components/settings/ExportData.jsx
import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { useNotification } from "../../context";
import { apiClient } from "../../services";
import { getErrorMessage } from "../../utils";

const ExportData = () => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useNotification();

  const handleExport = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await apiClient.get("/auth/export-data");

      // Create downloadable JSON file
      const blob = new Blob([JSON.stringify(data)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `my-data-${new Date().toISOString().split("T")[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);

      showToast("Your data has been downloaded.", "success");
    } catch (err) {
      showToast(getErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="w-full flex items-center justify-between rounded-lg 
                 bg-gray-50 dark:bg-gray-700/50 p-4 
                 hover:bg-gray-100 dark:hover:bg-gray-700 
                 transition-colors text-left
                 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-center space-x-3">
        <span className="text-xl">📦</span>
        <div>
          <p className="font-medium text-gray-800 dark:text-white">
            Export My Data
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Download all your data as JSON
          </p>
        </div>
      </div>
      {loading ? (
        <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
      ) : (
        <Download className="h-5 w-5 text-gray-400" />
      )}
    </button>
  );
};

export default ExportData;
