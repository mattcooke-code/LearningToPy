// analyticsUtils.js
import { downloadContent } from "../utils";

export const exportToCSV = (data, filename) => {
  const csv = convertToCSV(data);

  downloadContent(
    csv,
    `${filename}-${new Date().toISOString()}.csv`,
    "text/csv"
  );
};
