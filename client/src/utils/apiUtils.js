// /client/utils/apiUtils.js

/**
 * Extracts the inner 'data' payload from the standardized backend envelope.
 * Backend structure: { success: bool, message: str, data: { ... } }
 * Axios structure: response.data = { success: bool, message: str, data: { ... } }
 */
export const extractData = (response) => {
  if (!response || !response.data) {
    throw new Error("No response received from server");
  }

  const envelope = response.data;

  if (envelope.success === false) {
    throw new Error(envelope.message || "Request failed");
  }

  return envelope.data;
};
