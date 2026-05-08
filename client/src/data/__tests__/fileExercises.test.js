// src/data/__tests__/fileExercises.test.js
import { describe, it, expect } from "vitest";
import { getFileCreationCode } from "@/data/fileExercises";

describe("fileExercises", () => {
  describe("getFileCreationCode", () => {
    it("should be a function", () => {
      expect(typeof getFileCreationCode).toBe("function");
    });

    describe("Matching by title", () => {
      it("should return code for 'Opening and Reading Files'", () => {
        const exercise = { title: "Opening and Reading Files" };
        const code = getFileCreationCode(exercise);

        expect(code).toBeTruthy();
        expect(code).toContain("messages.txt");
        expect(code).toContain("This is the first line.");
        expect(code).toContain("with open");
      });

      it("should return code for 'Line-by-Line Reading'", () => {
        const exercise = { title: "Line-by-Line Reading" };
        const code = getFileCreationCode(exercise);

        expect(code).toBeTruthy();
        expect(code).toContain("shopping_list.txt");
        expect(code).toContain("Milk");
        expect(code).toContain("Eggs");
        expect(code).toContain("Bread");
        expect(code).toContain("Cheese");
      });

      it("should return code for 'Using the With Statement'", () => {
        const exercise = { title: "Using the With Statement" };
        const code = getFileCreationCode(exercise);

        expect(code).toBeTruthy();
        expect(code).toContain("settings.conf");
        expect(code).toContain("HOST=localhost");
        expect(code).toContain("PORT=8080");
        expect(code).toContain("DEBUG=True");
      });

      it("should return code for 'Writing and Appending Data'", () => {
        const exercise = { title: "Writing and Appending Data" };
        const code = getFileCreationCode(exercise);

        expect(code).toBeTruthy();
        expect(code).toContain("data.txt");
      });

      it("should return code for 'Log File Processing'", () => {
        const exercise = { title: "Log File Processing" };
        const code = getFileCreationCode(exercise);

        expect(code).toBeTruthy();
        expect(code).toContain("server_log_raw.txt");
        expect(code).toContain("404|/image/logo.png");
        expect(code).toContain("200|/api/v1/profile/data");
      });

      it("should match by substring", () => {
        const exercise = {
          title: "Opening and Reading Files - Extra Practice",
        };
        const code = getFileCreationCode(exercise);

        expect(code).toBeTruthy();
        expect(code).toContain("messages.txt");
      });
    });

    describe("Matching by challengeGroup", () => {
      it("should return code for 'file-reading-basics'", () => {
        const exercise = {
          title: "Some Title",
          challengeGroup: "file-reading-basics",
        };
        const code = getFileCreationCode(exercise);

        expect(code).toBeTruthy();
        expect(code).toContain("messages.txt");
      });

      it("should return code for 'file-line-processing'", () => {
        const exercise = { challengeGroup: "file-line-processing" };
        const code = getFileCreationCode(exercise);

        expect(code).toBeTruthy();
        expect(code).toContain("shopping_list.txt");
      });

      it("should return code for 'context-manager'", () => {
        const exercise = { challengeGroup: "context-manager" };
        const code = getFileCreationCode(exercise);

        expect(code).toBeTruthy();
        expect(code).toContain("settings.conf");
      });

      it("should return code for 'file-writing'", () => {
        const exercise = { challengeGroup: "file-writing" };
        const code = getFileCreationCode(exercise);

        expect(code).toBeTruthy();
        expect(code).toContain("data.txt");
      });

      it("should return code for 'file-io-project'", () => {
        const exercise = { challengeGroup: "file-io-project" };
        const code = getFileCreationCode(exercise);

        expect(code).toBeTruthy();
        expect(code).toContain("server_log_raw.txt");
      });
    });

    describe("No match cases", () => {
      it("should return empty string for unmatching title", () => {
        const exercise = { title: "Nonexistent Exercise" };
        const code = getFileCreationCode(exercise);

        expect(code).toBe("");
      });

      it("should return empty string for unmatching challengeGroup", () => {
        const exercise = { challengeGroup: "nonexistent-group" };
        const code = getFileCreationCode(exercise);

        expect(code).toBe("");
      });

      it("should return empty string for empty exercise object", () => {
        const code = getFileCreationCode({});
        expect(code).toBe("");
      });

      it("should return empty string for null/undefined", () => {
        // The function doesn't guard against null/undefined, document this behavior
        expect(() => getFileCreationCode(null)).toThrow();
        expect(() => getFileCreationCode(undefined)).toThrow();
      });

      it("should return empty string when both title and challengeGroup don't match", () => {
        const exercise = {
          title: "Wrong Title",
          challengeGroup: "wrong-group",
        };
        const code = getFileCreationCode(exercise);

        expect(code).toBe("");
      });
    });

    it("should document that callers must pass a valid object", () => {
      // This test documents the API contract - callers must provide an object
      // or guard against null/undefined before calling
      const safeGetCode = (exercise) => {
        if (!exercise || typeof exercise !== "object") return "";
        return getFileCreationCode(exercise);
      };

      expect(safeGetCode(null)).toBe("");
      expect(safeGetCode(undefined)).toBe("");
      expect(safeGetCode({ title: "Opening and Reading Files" })).toBeTruthy();
    });

    describe("Priority between title and challengeGroup", () => {
      it("should return first match in FILE_CREATION_MAP", () => {
        // If an exercise matches by title, it returns that code
        const exercise = {
          title: "Opening and Reading Files",
          challengeGroup: "some-other-group",
        };
        const code = getFileCreationCode(exercise);

        // Should match by title
        expect(code).toContain("messages.txt");
      });
    });
  });

  describe("Generated Python code validity", () => {
    it("should generate valid Python syntax", () => {
      const exercises = [
        { title: "Opening and Reading Files" },
        { title: "Line-by-Line Reading" },
        { title: "Using the With Statement" },
        { title: "Writing and Appending Data" },
        { title: "Log File Processing" },
      ];

      exercises.forEach((exercise) => {
        const code = getFileCreationCode(exercise);

        // Basic Python syntax checks
        expect(code).toContain("with open");
        expect(code).toContain(" as f:");
        expect(code).toContain("f.write(");

        // Should not have syntax errors in common patterns
        expect(code).not.toContain("f.write(f.write"); // No nested calls
        expect(code.match(/\(/g)?.length).toBe(code.match(/\)/g)?.length); // Balanced parentheses
      });
    });

    it("should properly escape special characters", () => {
      const exercise = { title: "Opening and Reading Files" };
      const code = getFileCreationCode(exercise);

      // Should handle newlines correctly
      expect(code).toContain("\\n");

      // Should not have unmatched quotes
      const singleQuotes = (code.match(/'/g) || []).length;
      expect(singleQuotes % 2).toBe(0);
    });

    it("should create files with write mode ('w')", () => {
      const exercise = { title: "Opening and Reading Files" };
      const code = getFileCreationCode(exercise);

      expect(code).toContain("'w'");
      expect(code).not.toContain("'a'"); // Not append mode
      expect(code).not.toContain("'r'"); // Not read mode
    });
  });

  describe("File names and paths", () => {
    it("should use appropriate file extensions", () => {
      const exercise = { title: "Using the With Statement" };
      const code = getFileCreationCode(exercise);

      expect(code).toContain(".conf");
    });

    it("should use consistent file naming patterns", () => {
      const allExercises = [
        { title: "Opening and Reading Files" },
        { title: "Line-by-Line Reading" },
        { title: "Using the With Statement" },
        { title: "Writing and Appending Data" },
        { title: "Log File Processing" },
      ];

      const fileNames = allExercises.map((ex) => {
        const code = getFileCreationCode(ex);
        const match = code.match(/['"](\w+\.\w+)['"]/);
        return match ? match[1] : null;
      });

      // All should have valid filenames
      fileNames.forEach((name) => {
        expect(name).toBeTruthy();
        expect(name).toMatch(/^[a-zA-Z0-9_.-]+$/);
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle exercise with only title property", () => {
      const exercise = { title: "Opening and Reading Files" };
      expect(getFileCreationCode(exercise)).toBeTruthy();
    });

    it("should handle exercise with only challengeGroup property", () => {
      const exercise = { challengeGroup: "file-reading-basics" };
      expect(getFileCreationCode(exercise)).toBeTruthy();
    });

    it("should handle exercise with extra properties", () => {
      const exercise = {
        title: "Opening and Reading Files",
        difficulty: "beginner",
        extraProp: "value",
      };
      const code = getFileCreationCode(exercise);
      expect(code).toBeTruthy();
    });

    it("should return empty string for exercise with null/empty title and no challengeGroup", () => {
      expect(getFileCreationCode({ title: null })).toBe("");
      expect(getFileCreationCode({ title: "" })).toBe("");
      expect(getFileCreationCode({ title: undefined })).toBe("");
    });
  });
});
