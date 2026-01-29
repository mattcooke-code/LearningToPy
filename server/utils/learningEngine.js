// learningEngine.js
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const { findNextLesson, findNextModule } = require("./navigation");
const { calculateStreakUpdate } = require("./gamification");
const { normalizeTags } = require("./generalUtils");
const { hasQuiz, hasExercise, isQuizCompleted } = require("./quizHelpers");

/**
 * --- VALIDATION LOGIC ---
 */
const validateCodeSubmission = (userCode, exercise) => {
  if (!userCode || userCode.trim() === "") {
    return {
      isCorrect: false,
      feedback: "Please write some code before submitting!",
    };
  }
  if (exercise.starterCode && userCode.trim() === exercise.starterCode.trim()) {
    return { isCorrect: false, feedback: "Please modify the starter code!" };
  }

  const lines = userCode.split("\n");
  const hasEmptyAssignments = lines.some((line) =>
    line.match(/^\s*\w+\s*=\s*$/),
  );
  const hasPlaceholderComments = lines.some((line) =>
    line.match(/#\s*(TODO|FIXME|your code here)/i),
  );

  if (hasEmptyAssignments || hasPlaceholderComments) {
    return { isCorrect: false, feedback: "Please complete all assignments!" };
  }
  return { isCorrect: true, feedback: "Great job!" };
};

/**
 * --- STATS TRACKING ---
 */
const updateUserStats = (user, lessonRecord, submissionBody) => {
  user.stats = user.stats || {};
  const { elapsedSeconds, usedHints, attemptNumber, wasOptimalSolution } =
    submissionBody;
  const isChallenge = lessonRecord.contentType !== "theory";

  const ensureStat = (key) => {
    if (typeof user.stats[key] !== "number") user.stats[key] = 0;
  };

  if (isChallenge) {
    const tags = lessonRecord.tags || [];
    if (elapsedSeconds > 0 && elapsedSeconds <= 30) {
      ensureStat("fastChallengeCount");
      user.stats.fastChallengeCount++;
    }
    if (Number(attemptNumber) === 1 && !usedHints) {
      ensureStat("firstTryChallengeCount");
      user.stats.firstTryChallengeCount++;
    }
    if (wasOptimalSolution) {
      ensureStat("optimalSolutionCount");
      user.stats.optimalSolutionCount++;
    }

    // Tag-based stats
    if (tags.includes("functions")) {
      ensureStat("functionChallengeCount");
      user.stats.functionChallengeCount++;
    }
    if (tags.some((t) => ["api", "apis", "http"].includes(t))) {
      ensureStat("apiChallengeCount");
      user.stats.apiChallengeCount++;
    }
    if (tags.some((t) => ["files", "file-io"].includes(t))) {
      ensureStat("fileChallengeCount");
      user.stats.fileChallengeCount++;
    }
  }
};

/**
 * --- COMPLETION CORE ---
 */
const createLessonCompletionRecord = (lesson, submissionBody, timestamp) => {
  return {
    lessonId: lesson._id.toString(),
    completedAt: timestamp,
    tags: normalizeTags(lesson.tags),
    contentType: lesson.contentType,
    difficulty: lesson.difficulty,
    challengeGroup: lesson.challengeGroup?.toLowerCase(),
    elapsedSeconds: submissionBody.elapsedSeconds,
    attemptNumber: submissionBody.attemptNumber,
    usedHints: !!submissionBody.usedHints,
    wasOptimal: !!submissionBody.wasOptimalSolution,
  };
};

const ensureNotAlreadyCompleted = (completedArray, itemId) => {
  if (completedArray.includes(itemId)) {
    return {
      xpIncrease: 0,
      newlyCompleted: false,
      nextId: null,
    };
  }
  return null;
};

/**
 * Main Orchestrator for Lesson Completion
 */
const processLessonCompletion = async (user, lesson, submissionBody) => {
  const lessonId = lesson._id.toString();

  const alreadyCompleted = ensureNotAlreadyCompleted(
    user.completedLessons,
    lessonId,
  );
  if (alreadyCompleted) {
    alreadyCompleted.nextLessonId = await findNextLesson(lesson);
    return alreadyCompleted;
  }

  // Mark Completion & XP
  user.completedLessons.push(lessonId);
  const xpIncrease = lesson.xpReward || 50;
  user.xp += xpIncrease;

  // Streak
  const streakUpdate = calculateStreakUpdate(user.lastActive);
  if (streakUpdate.streakAction === "$inc") {
    user.streak += streakUpdate.value;
  } else if (
    streakUpdate.streakAction === "$set" &&
    streakUpdate.value !== null
  ) {
    user.streak = streakUpdate.value;
  }

  user.lastActive = new Date();

  // Create History & Update Stats
  const record = createLessonCompletionRecord(
    lesson,
    submissionBody,
    user.lastActive,
  );
  user.lessonCompletionHistory.push(record);
  updateUserStats(user, record, submissionBody);

  return {
    xpIncrease,
    newlyCompleted: true,
    nextLessonId: await findNextLesson(lesson),
  };
};

const processModuleCompletion = async (user, module, quizScore) => {
  const moduleId = module._id.toString();

  const alreadyCompleted = ensureNotAlreadyCompleted(
    user.completedModules,
    moduleId,
  );
  if (alreadyCompleted) {
    alreadyCompleted.nextModuleId = await findNextModule(module);
    return alreadyCompleted;
  }

  // Mark completion
  user.completedModules.push(moduleId);
  const xpIncrease = module.xpReward || 100;
  user.xp += xpIncrease;

  // Update Streak
  const streakUpdate = calculateStreakUpdate(user.lastActive);
  if (streakUpdate.streakAction === "$inc") {
    user.streak += streakUpdate.value;
  } else if (
    streakUpdate.streakAction === "$set" &&
    streakUpdate.value !== null
  ) {
    user.streak = streakUpdate.value;
  }

  user.lastActive = new Date();

  // Add to history
  if (!Array.isArray(user.moduleCompletionHistory)) {
    user.moduleCompletionHistory = [];
  }
  user.moduleCompletionHistory.push({
    moduleId: module._id,
    completedAt: new Date(),
  });

  user.xp += xpIncrease;
  user.lastActive = new Date();

  return {
    xpIncrease,
    newlyCompleted: true,
    nextModuleId: await findNextModule(module),
  };
};

/**
 * Check if lesson is fully completed based on its components
 */
const isLessonFullyCompleted = (
  lesson,
  quizProgress,
  isCorrect,
  forceComplete = false,
) => {
  const lessonHasQuiz = hasQuiz(lesson);
  const lessonHasExercise = hasExercise(lesson);

  // If frontend explicity marks as complete
  if (forceComplete) return true;

  // Theory lesson without quiz/exercise
  if (lesson.contentType === "theory" && !lessonHasQuiz && !lessonHasExercise) {
    return true;
  }

  // Exercise-only lesson
  if (lessonHasExercise && !lessonHasQuiz && isCorrect) {
    return true;
  }

  // Quiz-only lesson
  if (!lessonHasExercise && lessonHasQuiz) {
    return isQuizCompleted(quizProgress, lesson);
  }

  // Lesson with both exercise AND quiz
  if (lessonHasExercise && lessonHasQuiz) {
    return isCorrect && isQuizCompleted(quizProgress, lesson);
  }

  return false;
};

/**
 * Calculates the current curriculum progress for a user.
 * @param {Object} user - The Mongoose user document
 * @param {Object} models - Object containing Lesson and Module models
 * @returns {Object} { totalCurriculumLessons, completedCurriculumCount }
 */
const getCurriculumProgressStats = async (user, { Lesson, Module }) => {
  // 1. Identify which modules count as "curriculum"
  const curriculumModules = await Module.find({
    order: { $gt: 0 },
    isPublished: true,
  }).select("_id");

  const curriculumModuleIds = curriculumModules.map((m) => m._id);

  // 2. Denominator: Total lessons in those modules
  const totalCurriculumLessons = await Lesson.countDocuments({
    isPublished: true,
    moduleId: { $in: curriculumModuleIds },
  });

  // 3. Numerator: User's completions within those modules
  const completedCurriculumCount = await Lesson.countDocuments({
    _id: { $in: user.completedLessons },
    isPublished: true,
    moduleId: { $in: curriculumModuleIds },
  });

  return {
    totalCurriculumLessons,
    completedCurriculumCount,
  };
};

module.exports = {
  validateCodeSubmission,
  processLessonCompletion,
  processModuleCompletion,
  isLessonFullyCompleted,
  getCurriculumProgressStats,
};
