// /client/src/hooks/useContentFilter.js
/**
 * @fileoverview Content filtering and sorting hook.
 *
 * Provides filter state (type, status, difficulty, search) and sort
 * configuration for an array of content items. Returns the filtered and sorted
 * result via `useMemo` so it only recalculates when inputs change.
 *
 * @module hooks/useContentFilter
 * @requires react
 */

import { useCallback, useState, useMemo } from "react";

/**
 * Create filter/sort state and a memoised filtered result for a content array.
 *
 * @param {object[]} initialContent - The full, unfiltered array of content
 *   items. Each item should have `type`, `isPublished`, `difficulty`, `title`,
 *   `description`, `_id`, and optionally `tags`.
 * @returns {{
 *   filters: { type: string, status: string, difficulty: string, search: string },
 *   setFilters: Function,
 *   sortConfig: { field: string, direction: 'ascend'|'descend' },
 *   handleSort: Function,
 *   filteredContent: object[],
 *   clearFilters: Function
 * }}
 */
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
    let result = [initialContent];

    if (filters.type !== "all") {
      result = result.filter((item) => item.type === filters.type);
    }

    if (filters.status !== "all") {
      result = result.filter((item) =>
        filters.status === "published" ? item.isPublished : !item.isPublished,
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
          item.tags?.some((tag) => tag.toLowerCase().includes(term)),
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

  const handleSort = useCallback((field) => {
    setSortConfig((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "descend"
          ? "ascend"
          : "descend",
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({ type: "all", status: "all", difficulty: "all", search: "" });
  }, []);

  return {
    filters,
    setFilters,
    sortConfig,
    handleSort,
    filteredContent,
    clearFilters,
  };
};
