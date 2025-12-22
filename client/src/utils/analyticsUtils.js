// analyticsUtils.js

export const exportToCSV = (data, filename) => {
  const csv = convertToCSV(data);

  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}-${new Date().toISOString()}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};
