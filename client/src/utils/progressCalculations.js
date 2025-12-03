import { XP } from "../../../shared/constants/progress";

/** Calculate progress percentage for lessons within a specific module */
export const calculateModuleLessonProgress = (lessons = []) => {
  const completedLessons = lessons.filter(
    (lesson) => lesson.isCompleted
  ).length;
  const totalLessons = lessons.length;
  let moduleLessonProgress = 0;

  if (totalLessons > 0) {
    moduleLessonProgress = Math.round((completedLessons / totalLessons) * 100);
  }

  return { completedLessons, totalLessons, moduleLessonProgress };
};

/** Calculate percentage of modules completed */
export const calculateModulesCompletionProgress = (
  completedModules,
  totalModules
) => {
  if (totalModules === 0) return 0;
  return Math.round((completedModules / totalModules) * 100);
};

/** Calculate average progress across all modules (average of module lesson progress) */
export const calculateAverageModuleProgress = (modules = []) => {
  if (modules.length === 0) return 0;

  const totalProgress = modules.reduce(
    (sum, module) => sum + (module.moduleLessonProgress || 0),
    0
  );
  return Math.round(totalProgress / modules.length);
};

/** Calculate XP progress towards next level */
export const calculateLevelProgress = (currentXP) => {
  const currentLevel = Math.floor(currentXP / XP.PER_LEVEL) + 1;
  const xpInCurrentLevel = currentXP % XP.PER_LEVEL;
  const progressCompleted = (xpInCurrentLevel / XP.PER_LEVEL) * 100;

  return {
    currentLevel,
    xpInCurrentLevel,
    progressCompleted: Math.round(progressCompleted),
    xpNeededForNextLevel: XP.PER_LEVEL - xpInCurrentLevel,
  };
};
