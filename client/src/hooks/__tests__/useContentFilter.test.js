import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useContentFilter } from "../useContentFilter";

// ============================================================================
// Test data
// ============================================================================

const mockContent = [
  {
    _id: "1",
    title: "Python Basics",
    description: "Introduction to Python",
    type: "lesson",
    isPublished: true,
    difficulty: "BEGINNER",
    tags: ["python", "intro"],
    updatedAt: "2026-05-01",
  },
  {
    _id: "2",
    title: "Advanced JavaScript",
    description: "Deep dive into JS",
    type: "lesson",
    isPublished: false,
    difficulty: "ADVANCED",
    tags: ["javascript", "advanced"],
    updatedAt: "2026-04-15",
  },
  {
    _id: "3",
    title: "Data Structures",
    description: "Learn about arrays and objects",
    type: "module",
    isPublished: true,
    difficulty: "INTERMEDIATE",
    tags: ["computer-science", "data"],
    updatedAt: "2026-05-10",
  },
  {
    _id: "4",
    title: "Web Development",
    description: "HTML, CSS, and JavaScript",
    type: "module",
    isPublished: true,
    difficulty: "BEGINNER",
    tags: ["web", "html"],
    updatedAt: "2026-03-20",
  },
];

// ============================================================================
// useContentFilter
// ============================================================================

describe("useContentFilter", () => {
  // ---- Initial state ----
  it("returns all content unfiltered by default", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    expect(result.current.filteredContent).toHaveLength(4);
    expect(result.current.filters).toEqual({
      type: "all",
      status: "all",
      difficulty: "all",
      search: "",
    });
  });

  // ---- Type filter ----
  it("filters by type: lesson", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, type: "lesson" }));
    });

    expect(result.current.filteredContent).toHaveLength(2);
    result.current.filteredContent.forEach((item) => {
      expect(item.type).toBe("lesson");
    });
  });

  it("filters by type: module", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, type: "module" }));
    });

    expect(result.current.filteredContent).toHaveLength(2);
    result.current.filteredContent.forEach((item) => {
      expect(item.type).toBe("module");
    });
  });

  // ---- Status filter ----
  it("filters by status: published", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, status: "published" }));
    });

    expect(result.current.filteredContent).toHaveLength(3);
    result.current.filteredContent.forEach((item) => {
      expect(item.isPublished).toBe(true);
    });
  });

  it("filters by status: draft (unpublished)", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, status: "draft" }));
    });

    expect(result.current.filteredContent).toHaveLength(1);
    expect(result.current.filteredContent[0].isPublished).toBe(false);
  });

  // ---- Difficulty filter ----
  it("filters by difficulty: BEGINNER", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        difficulty: "BEGINNER",
      }));
    });

    expect(result.current.filteredContent).toHaveLength(2);
    result.current.filteredContent.forEach((item) => {
      expect(item.difficulty).toBe("BEGINNER");
    });
  });

  it("filters by difficulty: ADVANCED", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        difficulty: "ADVANCED",
      }));
    });

    expect(result.current.filteredContent).toHaveLength(1);
    expect(result.current.filteredContent[0].difficulty).toBe("ADVANCED");
  });

  // ---- Search filter ----
  it("filters by search term in title", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, search: "python" }));
    });

    expect(result.current.filteredContent).toHaveLength(1);
    expect(result.current.filteredContent[0].title).toBe("Python Basics");
  });

  it("filters by search term in description", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, search: "arrays" }));
    });

    expect(result.current.filteredContent).toHaveLength(1);
    expect(result.current.filteredContent[0].title).toBe("Data Structures");
  });

  it("filters by search term in tags", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters((prev) => ({ ...prev, search: "html" }));
    });

    expect(result.current.filteredContent).toHaveLength(1);
    expect(result.current.filteredContent[0].title).toBe("Web Development");
  });

  it("search is case-insensitive", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        search: "JAVASCRIPT",
      }));
    });

    expect(result.current.filteredContent).toHaveLength(2);
  });

  it("returns empty array when no content matches search", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters((prev) => ({
        ...prev,
        search: "nonexistent",
      }));
    });

    expect(result.current.filteredContent).toHaveLength(0);
  });

  // ---- Combined filters ----
  it("combines multiple filters", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters({
        type: "lesson",
        status: "published",
        difficulty: "all",
        search: "",
      });
    });

    expect(result.current.filteredContent).toHaveLength(1);
    expect(result.current.filteredContent[0]._id).toBe("1");
  });

  // ---- Sorting ----
  it("sorts by updatedAt descending by default", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    const ids = result.current.filteredContent.map((item) => item._id);
    // Most recent first: 3 (May 10), 1 (May 1), 2 (Apr 15), 4 (Mar 20)
    expect(ids).toEqual(["3", "1", "2", "4"]);
  });

  it("can sort ascending", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.handleSort("updatedAt");
    });

    const ids = result.current.filteredContent.map((item) => item._id);
    expect(ids).toEqual(["4", "2", "1", "3"]);
  });

  it("toggles sort direction when same field is clicked twice", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    // Default: descend by updatedAt
    expect(result.current.sortConfig.direction).toBe("descend");

    // First click: switch to ascend
    act(() => {
      result.current.handleSort("updatedAt");
    });
    expect(result.current.sortConfig.direction).toBe("ascend");

    // Second click: switch back to descend
    act(() => {
      result.current.handleSort("updatedAt");
    });
    expect(result.current.sortConfig.direction).toBe("descend");
  });

  it("sorts by a different field", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.handleSort("title");
    });

    const titles = result.current.filteredContent.map((item) => item.title);
    // Descending by title (default on new field)
    expect(titles).toEqual([
      "Web Development",
      "Python Basics",
      "Data Structures",
      "Advanced JavaScript",
    ]);
  });

  // ---- Clear filters ----
  it("clearFilters resets all filters to defaults", () => {
    const { result } = renderHook(() => useContentFilter(mockContent));

    act(() => {
      result.current.setFilters({
        type: "lesson",
        status: "published",
        difficulty: "BEGINNER",
        search: "python",
      });
    });

    expect(result.current.filteredContent).toHaveLength(1);

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.filteredContent).toHaveLength(4);
    expect(result.current.filters).toEqual({
      type: "all",
      status: "all",
      difficulty: "all",
      search: "",
    });
  });

  // ---- Edge cases ----
  it("handles empty initial content array", () => {
    const { result } = renderHook(() => useContentFilter([]));

    expect(result.current.filteredContent).toHaveLength(0);
  });

  it("handles items with missing optional fields", () => {
    const sparseContent = [
      { _id: "1", title: "Only Title" },
      { _id: "2", description: "Only Description" },
    ];

    const { result } = renderHook(() => useContentFilter(sparseContent));

    // Should not crash
    expect(result.current.filteredContent).toHaveLength(2);
  });
});
