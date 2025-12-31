/**
 * Default form state for lesson creation/editing
 */
export const DEFAULT_LESSON_FORM_DATA = {
  title: "",
  description: "",
  content: "",
  difficulty: "beginner",
  xpReward: 100,
  estimatedTime: 15,
  order: 0,
  isPublished: false,
  tags: [],
  moduleId: "",
  prerequisiteLessonIds: [],
  challengeGroup: "",
  contentType: "theory",
  initialCode: "",
  testCases: "", // Keep as string for the UI Textarea
  solution: "",
  hints: [],
  questions: [],
};

/**
 * Safely maps an API lesson object to form-compatible data
 */
export const mapLessonToFormData = (lesson = {}) => {
  // Handle the testCases conversion from Array to String for the editor
  let displayTestCases = "";
  if (lesson.testCases) {
    displayTestCases =
      typeof lesson.testCases === "string"
        ? lesson.testCases
        : JSON.stringify(lesson.testCases, null, 2);
  }

  return {
    ...DEFAULT_LESSON_FORM_DATA,
    ...lesson, // Spread existing lesson data
    // Override with safe fallbacks and explicit formatting
    isPublished: Boolean(lesson.isPublished),
    tags: Array.isArray(lesson.tags) ? [...lesson.tags] : [],
    prerequisiteLessonIds: Array.isArray(lesson.prerequisiteLessonIds)
      ? lesson.prerequisiteLessonIds.map((id) => id._id || id) // Handle populated or unpopulated IDs
      : [],
    testCases: displayTestCases,
    hints: Array.isArray(lesson.hints) ? [...lesson.hints] : [],
    questions: Array.isArray(lesson.questions) ? [...lesson.questions] : [],
  };
};

/**
 * Normalizes form data for API submission
 */
export const normalizeLessonForAPI = (formData) => {
  const payload = { ...formData };

  // 1. Convert testCases back to JSON object/array if it's a valid string
  if (
    payload.contentType === "exercise" &&
    typeof payload.testCases === "string"
  ) {
    try {
      payload.testCases = payload.testCases.trim()
        ? JSON.parse(payload.testCases)
        : [];
    } catch (e) {
      console.error("Failed to parse test cases JSON", e);
      // Fallback or let the API handle the error
    }
  }

  // 2. Data Cleaning: Remove unused fields based on content type
  if (payload.contentType !== "exercise") {
    const exerciseFields = ["initialCode", "testCases", "solution", "hints"];
    exerciseFields.forEach((field) => delete payload[field]);
  }

  if (payload.contentType !== "quiz") {
    delete payload.questions;
  }

  // 3. Final Type Casting (Ensures no strings where numbers should be)
  payload.xpReward = Number(payload.xpReward);
  payload.estimatedTime = Number(payload.estimatedTime);
  payload.order = Number(payload.order);

  return payload;
};
