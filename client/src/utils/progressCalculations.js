// progressCalculations.js

/** Calculate progress percentage for a module */
export const calculateModuleProgress = (lessons = []) => {
  const completedLessons = lessons.filter(
    (lesson) => lesson.isCompleted
  ).length;
  const totalLessons = lessons.length;
  let moduleProgress = 0;

  if (totalLessons > 0) {
    moduleProgress = Math.round((completedLessons / totalLessons) * 100);
  }

  return { completedLessons, totalLessons, moduleProgress };
};

/** Calculate overall course progress across all modules */
export const calculateOverallProgress = (modules = []) => {
  if (modules.length === 0) return 0;

  const totalProgress = modules.reduce(
    (sum, module) => sum + (module.progress || 0),
    0
  );
  return Math.round(totalProgress / modules.length);
};

/** Calculate XP progress towards next level */
export const calculateLevelProgress = (currentXP, xpPerLevel = 100) => {
  const currentLevel = Math.floor(currentXP / xpPerLevel) + 1;
  const xpInCurrentLevel = currentXP % xpPerLevel;
  const progressToNextLevel = (xpInCurrentLevel / xpPerLevel) * 100;

  return {
    currentLevel,
    xpInCurrentLevel,
    progressToNextLevel: Math.round(progressToNextLevel),
    xpNeededForNextLevel: xpPerLevel - xpInCurrentLevel,
  };
};
