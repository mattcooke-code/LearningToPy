export { exportToCSV } from "./analyticsUtils";
export {
  THEME_COLORS,
  THEME_HOVER_COVERS,
  resolveCourseThemeColor,
  getHoverColor,
} from "./colorUtilities";
export { useConfirmActions } from "./confirmUtils";
export {
  createDownloadLink,
  triggerDownload,
  downloadContent,
  downloadPythonCode,
  downloadTerminalOutput,
} from "./fileDownloadUtils";
export { getErrorMessage, getAdminErrorMessage } from "./getErrorMessage";
export { getSuccessMessage } from "./getSuccessMessage";
export {
  calculateNextLessonManually,
  findFirstIncompleteLesson,
  getLessonStatistics,
} from "./lessonCalculations";
export {
  DEFAULT_MODULE_FORM_DATA,
  mapModuleToFormData,
  normalizeModuleForAPI,
} from "./moduleFormUtils";
export { PLATFORM_DEFAULTS } from "./platformDefaults";
export {
  calculateModuleLessonProgress,
  calculateModulesCompletionProgress,
  calculateAverageModuleProgress,
  calculateLevelProgress,
} from "./progressCalculations";
export {
  calculateContentStats,
  calculateModuleEditorStats,
  calculateUserDashboardStats,
} from "./statsManagement";
export { normalizeUserData } from "./userUtils";
export { validateWithPyodide } from "./validationUtils";
