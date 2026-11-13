// /services/index.js

export {
  apiClient,
  authApiClient,
  adminApiClient,
  setupInterceptors,
  BACKEND_URL,
} from "./api";
export {
  getSessionId,
  setupSessionEndTracking,
  clearSessionId,
  sendSessionEnd,
} from "./session";
