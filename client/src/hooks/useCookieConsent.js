// /client/src/hooks/useCookieConsent.js
import { useState, useEffect, useContext } from "react";
import { useAuth } from "../context";
import { apiClient } from "../services";

export const CONSENT_KEY = "cookie-consent";
export const CONSENT_DATE_KEY = "cookie-consent-date";
export const CONSENT_EVENT = "cookie-consent-changed";

/**
 * @returns {"ACCEPTED" | "DECLINED" | null} null means no choice made yet.
 */
export const useCookieConsent = () => {
  const [consent, setConsent] = useState(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(CONSENT_KEY);
  });

  const { user, isAuthenticated } = useAuth();

  // Sync localStorage consent to backend when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && consent && user?.cookieConsent !== consent) {
      syncConsentToBackend(consent);
    }
  }, [isAuthenticated, user?.cookieConsent, consent]);

  useEffect(() => {
    const handler = (e) => setConsent(e.detail);
    window.addEventListener(CONSENT_EVENT, handler);
    return () => window.removeEventListener(CONSENT_EVENT, handler);
  }, []);

  return consent;
};

/**
 * Record the user's consent choice and notify any mounted listeners.
 * Syncs to backend if user is authenticated.
 *
 * @param {"ACCEPTED" | "DECLINED"} value
 */
export const setCookieConsent = async (value) => {
  const date = new Date().toISOString();

  // Always store in localStorage
  localStorage.setItem(CONSENT_KEY, value);
  localStorage.setItem(CONSENT_DATE_KEY, date);

  // Broadcast change to all components
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));

  await syncConsentToBackend(value, date);
};

/**
 * Sync consent choice to the backend if user is authenticated
 */
const syncConsentToBackend = async (value, date) => {
  try {
    await apiClient.patch("/auth/cookie-consent", {
      cookieConsent: value,
      cookieConsentDate: date || new Date().toISOString(),
    });
  } catch (error) {
    // If 401, user isn't authenticated - localStorage is source of truth
    if (error.response?.status !== 401) {
      console.error("Failed to sync cookie consent to backend:", error);
    }
  }
};

/**
 * Force sync localStorage consent to backend.
 * Call this after successful login or registration.
 */
export const syncStoredConsentToBackend = async () => {
  const storedConsent = localStorage.getItem(CONSENT_KEY);
  const storedDate = localStorage.getItem(CONSENT_DATE_KEY);

  if (storedConsent) {
    await syncConsentToBackend(storedConsent, storedDate);
  }
};
