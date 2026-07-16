// components/settings/CookieNotice.jsx
import { useState, useEffect } from "react";
import { CONSENT_KEY, setCookieConsent } from "../../hooks/useCookieConsent";

const CookieNotice = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    // Only show if no choice has been made
    setVisible(
      stored !== "ACCEPTED" &&
        stored !== "DECLINED" &&
        stored !== "accepted" &&
        stored !== "declined",
    );
  }, []);

  const choose = async (value) => {
    await setCookieConsent(value.toUpperCase());
    setVisible(false);
  };

  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [visible]);

  if (!visible) return null;

  return (
    <aside
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm 
                    bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                    rounded-lg shadow-lg p-4 z-50"
      aria-label="Cookie consent"
      role="dialog"
      aria-modal="false"
    >
      <div className="text-sm text-gray-700 dark:text-gray-300">
        <p className="font-medium mb-1">🍪 Cookie notice</p>
        <p>
          We use one essential cookie to keep you logged in — this is required
          for the site to work and isn't optional. Your choice below only
          affects optional extras (like anonymous, cookie-free analytics, which
          we don't currently use). Learning progress tracking, such as XP and
          streaks, always stays on since it's core to how the platform works.
        </p>
        <a
          href="/privacy"
          className="text-blue-600 dark:text-blue-400 hover:underline text-xs mt-1 inline-block"
        >
          Learn more →
        </a>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => choose("declined")}
          className="flex-1 text-sm px-3 py-1.5 rounded-md border border-gray-300 
                     dark:border-gray-600 text-gray-700 dark:text-gray-200 
                     hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Decline
        </button>
        <button
          onClick={() => choose("accepted")}
          className="flex-1 text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white 
                     hover:bg-blue-700"
        >
          Accept
        </button>
      </div>
    </aside>
  );
};

export default CookieNotice;
