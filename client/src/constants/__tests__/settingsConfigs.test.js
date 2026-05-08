// src/constants/__tests__/settingsConfigs.test.js
import { describe, it, expect } from "vitest";
import { SETTINGS_CONFIGS, ADMIN_TABS } from "@/constants/settingsConfigs";

describe("settingsConfigs", () => {
  describe("SETTINGS_CONFIGS Structure", () => {
    it("should be an object with all expected categories", () => {
      expect(typeof SETTINGS_CONFIGS).toBe("object");
      expect(SETTINGS_CONFIGS).toHaveProperty("general");
      expect(SETTINGS_CONFIGS).toHaveProperty("theme");
      expect(SETTINGS_CONFIGS).toHaveProperty("gamification");
      expect(SETTINGS_CONFIGS).toHaveProperty("features");
      expect(SETTINGS_CONFIGS).toHaveProperty("security");
      expect(SETTINGS_CONFIGS).toHaveProperty("advanced");
    });

    it("should have arrays for each category", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        expect(Array.isArray(category)).toBe(true);
        expect(category.length).toBeGreaterThan(0);
      });
    });

    it("should have unique keys across categories", () => {
      const allKeys = [];
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          allKeys.push(setting.key);
        });
      });
      const uniqueKeys = new Set(allKeys);
      expect(uniqueKeys.size).toBe(allKeys.length);
    });
  });

  describe("Settings Item Structure", () => {
    it("should have required properties for each setting", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          expect(setting).toHaveProperty("key");
          expect(setting).toHaveProperty("label");
          expect(setting).toHaveProperty("type");
          expect(setting).toHaveProperty("description");
          expect(typeof setting.key).toBe("string");
          expect(typeof setting.label).toBe("string");
          expect(typeof setting.type).toBe("string");
          expect(typeof setting.description).toBe("string");
        });
      });
    });

    it("should have valid keys (camelCase)", () => {
      const camelCaseRegex = /^[a-z][a-zA-Z0-9]*$/;
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          expect(camelCaseRegex.test(setting.key)).toBe(true);
        });
      });
    });

    it("should have non-empty labels and descriptions", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          expect(setting.label.length).toBeGreaterThan(0);
          expect(setting.description.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe("Setting Types", () => {
    it("should only use valid types", () => {
      const validTypes = ["number", "select", "color", "toggle"];
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          expect(validTypes).toContain(setting.type);
        });
      });
    });

    it("select type should have options.items array", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          if (setting.type === "select") {
            expect(setting).toHaveProperty("options");
            expect(setting.options).toHaveProperty("items");
            expect(Array.isArray(setting.options.items)).toBe(true);
            expect(setting.options.items.length).toBeGreaterThan(0);

            setting.options.items.forEach((item) => {
              expect(item).toHaveProperty("value");
              expect(item).toHaveProperty("label");
              expect(typeof item.value).toBe("string");
              expect(typeof item.label).toBe("string");
            });
          }
        });
      });
    });

    it("number type should have options with min and max", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          if (setting.type === "number") {
            expect(setting).toHaveProperty("options");
            expect(setting.options).toHaveProperty("min");
            expect(setting.options).toHaveProperty("max");
            expect(typeof setting.options.min).toBe("number");
            expect(typeof setting.options.max).toBe("number");
            expect(setting.options.min).toBeLessThan(setting.options.max);

            if (setting.options.step) {
              expect(typeof setting.options.step).toBe("number");
              expect(setting.options.step).toBeGreaterThan(0);
            }
          }
        });
      });
    });

    it("color type should not require options", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          if (setting.type === "color") {
            // Color type just needs key, label, type, description
            expect(setting.key).toBeTruthy();
          }
        });
      });
    });

    it("toggle type should not require options", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          if (setting.type === "toggle") {
            // Toggle type just needs key, label, type, description
            expect(setting.key).toBeTruthy();
          }
        });
      });
    });
  });

  describe("General Category", () => {
    const generalSettings = SETTINGS_CONFIGS.general;

    it("should have 3 settings", () => {
      expect(generalSettings).toHaveLength(3);
    });

    it("should have maxAvatarSize setting", () => {
      const setting = generalSettings.find((s) => s.key === "maxAvatarSize");
      expect(setting).toBeDefined();
      expect(setting.type).toBe("number");
      expect(setting.options.min).toBe(0.1);
      expect(setting.options.max).toBe(10);
      expect(setting.options.step).toBe(0.1);
    });

    it("should have defaultDifficulty setting", () => {
      const setting = generalSettings.find(
        (s) => s.key === "defaultDifficulty",
      );
      expect(setting).toBeDefined();
      expect(setting.type).toBe("select");
      expect(setting.options.items).toHaveLength(3);

      const values = setting.options.items.map((item) => item.value);
      expect(values).toContain("BEGINNER");
      expect(values).toContain("INTERMEDIATE");
      expect(values).toContain("ADVANCED");
    });

    it("should have maxLessonsPerModule setting", () => {
      const setting = generalSettings.find(
        (s) => s.key === "maxLessonsPerModule",
      );
      expect(setting).toBeDefined();
      expect(setting.type).toBe("number");
      expect(setting.options.min).toBe(1);
      expect(setting.options.max).toBe(50);
      expect(setting.options.step).toBeUndefined(); // No step for integers
    });
  });

  describe("Theme Category", () => {
    const themeSettings = SETTINGS_CONFIGS.theme;

    it("should have 3 settings", () => {
      expect(themeSettings).toHaveLength(3);
    });

    it("should have uiTheme setting", () => {
      const setting = themeSettings.find((s) => s.key === "uiTheme");
      expect(setting).toBeDefined();
      expect(setting.type).toBe("select");
      expect(setting.options.items).toHaveLength(3);

      const values = setting.options.items.map((item) => item.value);
      expect(values).toContain("light");
      expect(values).toContain("dark");
      expect(values).toContain("system");
    });

    it("should have themeColor setting", () => {
      const setting = themeSettings.find((s) => s.key === "themeColor");
      expect(setting).toBeDefined();
      expect(setting.type).toBe("color");
      expect(setting.options).toBeUndefined();
    });

    it("should have codeTheme setting", () => {
      const setting = themeSettings.find((s) => s.key === "codeTheme");
      expect(setting).toBeDefined();
      expect(setting.type).toBe("select");
      expect(setting.options.items).toHaveLength(2);

      const values = setting.options.items.map((item) => item.value);
      expect(values).toContain("dark");
      expect(values).toContain("light");
    });
  });

  describe("Gamification Category", () => {
    const gamificationSettings = SETTINGS_CONFIGS.gamification;

    it("should have 5 settings", () => {
      expect(gamificationSettings).toHaveLength(5);
    });

    it("should have xpPerLevel setting", () => {
      const setting = gamificationSettings.find((s) => s.key === "xpPerLevel");
      expect(setting).toBeDefined();
      expect(setting.type).toBe("number");
      expect(setting.options.min).toBe(10);
      expect(setting.options.max).toBe(1000);
    });

    it("should have moduleXpBonus setting", () => {
      const setting = gamificationSettings.find(
        (s) => s.key === "moduleXpBonus",
      );
      expect(setting).toBeDefined();
      expect(setting.type).toBe("number");
      expect(setting.options.min).toBe(0);
      expect(setting.options.max).toBe(5000);
    });

    it("should have streakBonusMultiplier setting", () => {
      const setting = gamificationSettings.find(
        (s) => s.key === "streakBonusMultiplier",
      );
      expect(setting).toBeDefined();
      expect(setting.type).toBe("number");
      expect(setting.options.min).toBe(1);
      expect(setting.options.max).toBe(3);
      expect(setting.options.step).toBe(0.1);
    });

    it("should have dailyStreakReward setting", () => {
      const setting = gamificationSettings.find(
        (s) => s.key === "dailyStreakReward",
      );
      expect(setting).toBeDefined();
      expect(setting.type).toBe("number");
      expect(setting.options.min).toBe(0);
      expect(setting.options.max).toBe(1000);
    });

    it("should have weeklyChallengeBonus setting", () => {
      const setting = gamificationSettings.find(
        (s) => s.key === "weeklyChallengeBonus",
      );
      expect(setting).toBeDefined();
      expect(setting.type).toBe("number");
      expect(setting.options.min).toBe(0);
      expect(setting.options.max).toBe(5000);
    });
  });

  describe("Features Category", () => {
    const featuresSettings = SETTINGS_CONFIGS.features;

    it("should have 9 settings", () => {
      expect(featuresSettings).toHaveLength(9);
    });

    it("should only contain toggle type settings", () => {
      featuresSettings.forEach((setting) => {
        expect(setting.type).toBe("toggle");
      });
    });

    it("should have all expected feature toggles", () => {
      const expectedKeys = [
        "enableLeaderboards",
        "enableBadges",
        "enableStreaks",
        "enableChallenges",
        "enableComments",
        "allowRegistrations",
        "maintenanceMode",
        "previewMode",
        "autoPublishNewContent",
      ];

      const actualKeys = featuresSettings.map((s) => s.key);
      expectedKeys.forEach((key) => {
        expect(actualKeys).toContain(key);
      });
    });

    it("should have descriptive labels for toggles", () => {
      featuresSettings.forEach((setting) => {
        expect(setting.label.length).toBeGreaterThan(5);
        expect(setting.description.length).toBeGreaterThan(10);
      });
    });
  });

  describe("Security Category", () => {
    const securitySettings = SETTINGS_CONFIGS.security;

    it("should have 3 settings", () => {
      expect(securitySettings).toHaveLength(3);
    });

    it("should have requireEmailVerification setting", () => {
      const setting = securitySettings.find(
        (s) => s.key === "requireEmailVerification",
      );
      expect(setting).toBeDefined();
      expect(setting.type).toBe("toggle");
    });

    it("should have requireStrongPassword setting", () => {
      const setting = securitySettings.find(
        (s) => s.key === "requireStrongPassword",
      );
      expect(setting).toBeDefined();
      expect(setting.type).toBe("toggle");
    });

    it("should have enable2FA setting", () => {
      const setting = securitySettings.find((s) => s.key === "enable2FA");
      expect(setting).toBeDefined();
      expect(setting.type).toBe("toggle");
    });
  });

  describe("Advanced Category", () => {
    const advancedSettings = SETTINGS_CONFIGS.advanced;

    it("should have 4 settings", () => {
      expect(advancedSettings).toHaveLength(4);
    });

    it("should have logIpAddresses setting", () => {
      const setting = advancedSettings.find((s) => s.key === "logIpAddresses");
      expect(setting).toBeDefined();
      expect(setting.type).toBe("toggle");
    });

    it("should have sessionTimeout setting", () => {
      const setting = advancedSettings.find((s) => s.key === "sessionTimeout");
      expect(setting).toBeDefined();
      expect(setting.type).toBe("number");
      expect(setting.options.min).toBe(5);
      expect(setting.options.max).toBe(1440);
    });

    it("should have maxLoginAttempts setting", () => {
      const setting = advancedSettings.find(
        (s) => s.key === "maxLoginAttempts",
      );
      expect(setting).toBeDefined();
      expect(setting.type).toBe("number");
      expect(setting.options.min).toBe(1);
      expect(setting.options.max).toBe(10);
    });

    it("should have maxFileSize setting", () => {
      const setting = advancedSettings.find((s) => s.key === "maxFileSize");
      expect(setting).toBeDefined();
      expect(setting.type).toBe("number");
      expect(setting.options.min).toBe(1);
      expect(setting.options.max).toBe(100);
    });
  });

  describe("Value Validation", () => {
    it("number settings should have logical min/max ranges", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          if (setting.type === "number") {
            // Min should be >= 0 unless it's streakBonusMultiplier (min 1)
            if (setting.key !== "streakBonusMultiplier") {
              expect(setting.options.min).toBeGreaterThanOrEqual(0);
            }
            // Max should be greater than min
            expect(setting.options.max).toBeGreaterThan(setting.options.min);
          }
        });
      });
    });

    it("select options should have unique values", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          if (setting.type === "select") {
            const values = setting.options.items.map((item) => item.value);
            const uniqueValues = new Set(values);
            expect(uniqueValues.size).toBe(values.length);
          }
        });
      });
    });

    it("select options should have unique labels", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          if (setting.type === "select") {
            const labels = setting.options.items.map((item) => item.label);
            const uniqueLabels = new Set(labels);
            expect(uniqueLabels.size).toBe(labels.length);
          }
        });
      });
    });
  });

  describe("ADMIN_TABS", () => {
    it("should be an array", () => {
      expect(Array.isArray(ADMIN_TABS)).toBe(true);
      expect(ADMIN_TABS.length).toBeGreaterThan(0);
    });

    it("should have correct structure for each tab", () => {
      ADMIN_TABS.forEach((tab) => {
        expect(tab).toHaveProperty("id");
        expect(tab).toHaveProperty("label");
        expect(tab).toHaveProperty("icon");
        expect(typeof tab.id).toBe("string");
        expect(typeof tab.label).toBe("string");
        expect(typeof tab.icon).toBe("string");
      });
    });

    it("should have 6 tabs", () => {
      expect(ADMIN_TABS).toHaveLength(6);
    });

    it("should have expected tab IDs", () => {
      const ids = ADMIN_TABS.map((tab) => tab.id);
      expect(ids).toContain("general");
      expect(ids).toContain("theme");
      expect(ids).toContain("gamification");
      expect(ids).toContain("features");
      expect(ids).toContain("security");
      expect(ids).toContain("advanced");
    });

    it("should have matching tab IDs with SETTINGS_CONFIGS categories", () => {
      const tabIds = ADMIN_TABS.map((tab) => tab.id);
      const categories = Object.keys(SETTINGS_CONFIGS);

      tabIds.forEach((id) => {
        expect(categories).toContain(id);
      });

      // Verify all categories have corresponding tabs
      categories.forEach((category) => {
        expect(tabIds).toContain(category);
      });
    });

    it("should have unique IDs", () => {
      const ids = ADMIN_TABS.map((tab) => tab.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it("should have unique labels", () => {
      const labels = ADMIN_TABS.map((tab) => tab.label);
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(labels.length);
    });

    it("should have descriptive labels", () => {
      ADMIN_TABS.forEach((tab) => {
        expect(tab.label.length).toBeGreaterThan(0);
      });
    });

    it("should have icon names as strings", () => {
      ADMIN_TABS.forEach((tab) => {
        // Icon should be a non-empty string (likely a component name)
        expect(tab.icon.length).toBeGreaterThan(0);
        // Should start with uppercase (React component convention)
        expect(tab.icon[0]).toBe(tab.icon[0].toUpperCase());
      });
    });

    it("should have expected tab order", () => {
      const expectedOrder = [
        "general",
        "theme",
        "gamification",
        "features",
        "security",
        "advanced",
      ];
      const actualOrder = ADMIN_TABS.map((tab) => tab.id);
      expect(actualOrder).toEqual(expectedOrder);
    });
  });

  describe("Integration Tests", () => {
    it("should have consistent total settings count", () => {
      let totalSettings = 0;
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        totalSettings += category.length;
      });

      // Sum of all settings: 3 + 3 + 5 + 9 + 3 + 4 = 27
      expect(totalSettings).toBe(27);
    });

    it("should have all settings with consistent key naming", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          // Keys should be descriptive
          expect(setting.key.length).toBeGreaterThan(3);
          // Keys should match their purpose
          expect(setting.label.length).toBeGreaterThan(3);
        });
      });
    });

    it("should have valid options for number inputs with steps", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          if (setting.type === "number" && setting.options.step) {
            // Step should make sense with min/max
            const range = setting.options.max - setting.options.min;
            expect(setting.options.step).toBeLessThanOrEqual(range);
          }
        });
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle settings with max value of 0 for min", () => {
      const zeroMinSettings = [];
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          if (setting.type === "number" && setting.options.min === 0) {
            zeroMinSettings.push(setting);
          }
        });
      });

      // These settings should make sense having 0 as minimum
      zeroMinSettings.forEach((setting) => {
        expect(setting.options.max).toBeGreaterThan(0);
      });
    });

    it("should have all labels as proper sentence case or title case", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          // First character should be uppercase
          expect(setting.label[0]).toBe(setting.label[0].toUpperCase());
        });
      });
    });

    it("should not have empty select option arrays", () => {
      Object.values(SETTINGS_CONFIGS).forEach((category) => {
        category.forEach((setting) => {
          if (setting.type === "select") {
            expect(setting.options.items.length).toBeGreaterThan(1);
          }
        });
      });
    });
  });
});
