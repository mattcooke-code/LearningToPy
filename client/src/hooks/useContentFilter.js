// useContentFilter.js
import { useState, useMemo } from "react";

export const useContentFilter = (initialContent) => {
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    difficulty: "all",
    search: "",
  });

  const [sortConfig, setSortConfig] = useState({
    field: "updatedAt",
    direction: "descend",
  });

  const filteredContent = useMemo(() => {
    let result = [...initialContent];

    if (filters.type !== "all") {
      result = result.filter((item) => item.type === filters.type);
    }

    if (filters.status !== "all") {
      result = result.filter((item) =>
        filters.status === "published" ? item.isPublished : !item.isPublished
      );
    }

    if (filters.difficulty !== "all") {
      result = result.filter((item) => item.difficulty === filters.difficulty);
    }

    if (filters.search) {
      const term = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(term) ||
          item.description?.toLowerCase().includes(term) ||
          item._id?.toLowerCase().includes(term) ||
          item.tags?.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    result.sort((a, b) => {
      const { field, direction } = sortConfig;
      const multiplier = direction === "ascend" ? 1 : -1;

      const valueA = a[field] ?? "";
      const valueB = b[field] ?? "";

      if (valueA < valueB) return -1 * multiplier;
      if (valueA > valueB) return 1 * multiplier;
      return 0;
    });

    return result;
  }, [initialContent, filters, sortConfig]);

  const handleSort = (field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "descend"
          ? "ascend"
          : "descend",
    }));
  };

  return {
    filters,
    setFilters,
    sortConfig,
    handleSort,
    filteredContent,
    clearFilters: () =>
      setFilters({ type: "all", status: "all", difficulty: "all", search: "" }),
  };
};
