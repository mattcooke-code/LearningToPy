// /services/index.js

export {
  apiClient,
  authApiClient,
  adminApiClient,
  setupInterceptors,
} from "./api";
export {
  getSessionId,
  setupSessionEndTracking,
  clearSessionId,
} from "./session";
