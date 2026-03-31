// getSuccessMessage.js
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
