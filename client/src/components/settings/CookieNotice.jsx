// components/settings/CookieNotice.jsx
import { useState } from "react";
import { X } from "lucide-react";

const CookieNotice = () => {
  const [visible, setVisible] = useState(() => {
    return !localStorage.getItem("cookie-notice-dismissed");
  });

  const dismiss = () => {
    localStorage.setItem("cookie-notice-dismissed", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm 
                    bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                    rounded-lg shadow-lg p-4 z-50"
      aria-label="Cookie notice"
      role="complementary"
    >
      <div className="flex items-start justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <p className="font-medium mb-1">🍪 Cookie notice</p>
          <p>
            We use one essential cookie to keep you logged in. No tracking or
            advertising cookies are used.
          </p>
          <a
            href="/privacy"
            className="text-blue-600 dark:text-blue-400 hover:underline text-xs mt-1 inline-block"
          >
            Learn more →
          </a>
        </div>
        <button
          onClick={dismiss}
          className="ml-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          aria-label="Dismiss cookie notice"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
};

export default CookieNotice;
