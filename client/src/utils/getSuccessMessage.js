// /client/src/utils/getSuccessMessage.js
/**
 * @fileoverview Success message generation utility.
 *
 * Produces consistent, human-readable success messages for common CRUD and
 * content management operations. Used by admin panels, forms, and mutation
 * handlers to display confirmation toasts and status messages.
 *
 * @module utils/getSuccessMessage
 */

/**
 * Generate a success message for a given action and resource type.
 *
 * Supported actions and their templates:
 * - `"create"`  → `"<Resource> created successfully"`
 * - `"update"`  → `"<Resource> updated successfully"`
 * - `"delete"`  → `"<Resource> deleted successfully"`
 * - `"save"`    → `"Changes saved successfully"`
 * - `"publish"` → `"Content published successfully"`
 * - `"archive"` → `"Content archived successfully"`
 * - `"restore"` → `"Content restored successfully"`
 * - Anything else → `"Operation completed successfully"`
 *
 * @param {string} action - The action key (e.g. `"create"`, `"delete"`).
 * @param {string} [resource="item"] - The name of the affected resource.
 *   Capitalised automatically in the output.
 * @returns {string} A human-readable success message.
 *
 * @example
 * getSuccessMessage("create", "module")
 * // "Module created successfully"
 *
 * getSuccessMessage("delete", "lesson")
 * // "Lesson deleted successfully"
 *
 * getSuccessMessage("save")
 * // "Changes saved successfully"
 */
export const getSuccessMessage = (action, resource = "item") => {
  const formattedResource =
    resource.charAt(0).toUpperCase() + resource.slice(1);

  const messages = {
    create: `${formattedResource} created successfully`,
    update: `${formattedResource} updated successfully`,
    delete: `${formattedResource} deleted successfully`,
    save: "Changes saved successfully",
    publish: "Content published successfully",
    archive: "Content archived successfully",
    restore: "Content restored successfully",
    default: "Operation completed successfully",
  };

  return messages[action] || messages.default;
};
