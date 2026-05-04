// services/moduleProgress.js
/**
 * Check if module prerequisites are met
 */
const checkPrerequisites = (module, userCompletedModules) => {
  if (!module.prerequisites || module.prerequisites.length === 0) {
    return { isLocked: false };
  }

  const unmetPrereqs = module.prerequisites.filter((prereq) => {
    return !userCompletedModules.includes(prereq._id.toString());
  });

  return {
    isLocked: unmetPrereqs.length > 0,
    unmetPrerequisites: unmetPrereqs,
  };
};

/**
 * Check if a module quiz has been passed
 */
const hasPassedModuleQuiz = (user, moduleId) => {
  return (
    user.quizAttempts?.some(
      (attempt) =>
        attempt.moduleId.toString() === moduleId.toString() && attempt.passed,
    ) ?? false
  );
};

/**
 * Get lesson completion count for a module
 */
const getModuleLessonCompletion = (lessons, userCompletedLessons) => {
  return lessons.filter((lesson) =>
    userCompletedLessons.includes(lesson._id.toString()),
  ).length;
};

module.exports = {
  checkPrerequisites,
  hasPassedModuleQuiz,
  getModuleLessonCompletion,
};
