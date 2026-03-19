// useSessionTracker.js
import { useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

export const useSessionTracker = (isAuthenticated) => {
  const sessionId = useRef(localStorage.getItem("sessionId") || uuidv4());
  const startTime = useRef(Date.now());
  const isTracking = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || isTracking.current) return;

    isTracking.current = true;

    localStorage.setItem("sessionId", sessionId.current);

    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const [url, config = {}] = args;
      config.headers = { ...config.headers, "x-session-id": sessionId.current };
      return originalFetch(url, config);
    };

    const handleBeforeUnload = () => {
      const endTime = Date.now();
      const duration = Math.round((endTime - startTime.current) / 1000);

      const data = JSON.stringify({
        actionType: "SESSION_END",
        sessionId: sessionId.current,
        duration,
        timestamp: new Date().toISOString(),
      });

      navigator.sendBeacon("/api/analytics/session-end", data);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isAuthenticated]);

  return { sessionId: sessionId.current };
};
