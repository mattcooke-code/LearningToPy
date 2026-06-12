// index.js
export { exportToCSV } from "./analyticsUtils";
export {
  resolveCourseThemeColor,
  getHoverColor,
  shouldUseThemeColor,
} from "./colorUtilities";
export { getDeviceInfo } from "./deviceInfo";
export {
  createDownloadLink,
  triggerDownload,
  downloadContent,
  downloadPythonCode,
  downloadTerminalOutput,
  convertToCSV,
} from "./fileDownloadUtils";
export { getErrorMessage, getAdminErrorMessage } from "./getErrorMessage";
export { getSuccessMessage } from "./getSuccessMessage";
export {
  calculateNextLessonManually,
  findFirstIncompleteLesson,
  getLessonStatistics,
} from "./lessonCalculations";
export {
  DEFAULT_LESSON_FORM_DATA,
  mapLessonToFormData,
  normalizeLessonForAPI,
} from "./lessonFormUtils";
export { slugifyHeading, parseContent } from "./markdownUtils";
export {
  DEFAULT_MODULE_FORM_DATA,
  mapModuleToFormData,
  normalizeModuleForAPI,
} from "./moduleFormUtils";
export { PLATFORM_DEFAULTS } from "./platformDefaults";
export {
  calculateModuleLessonProgress,
  calculateModulesCompletionProgress,
  calculateLevelProgress,
} from "./progressCalculations";
export {
  shuffleArray,
  buildShuffledOptions,
  getShuffledOptions,
  getActualIndex,
} from "./quizUtils";
export {
  calculateContentStats,
  calculateModuleEditorStats,
  calculateUserDashboardStats,
} from "./statsManagement";
export {
  getStoredAccessToken,
  isTokenValid,
  setTokenMemory,
} from "./tokenUtils";
export { normalizeUserData } from "./userUtils";
export { validateWithPyodide } from "./validationUtils";
