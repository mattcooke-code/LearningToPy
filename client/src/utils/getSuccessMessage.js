// getSuccessMessage.js
export const getSuccessMessage = (action, resource = "item") => {
  const messages = {
    create: `${resource} created successfully`,
    update: `${resource} updated successfully`,
    delete: `${resource} deleted successfully`,
    save: "Changes saved successfully",
    publish: "Content published successfully",
    archive: "Content archived successfully",
    restore: "Content restored successfully",
    default: "Operation completed successfully",
  };

  return messages[action] || messages.default;
};
