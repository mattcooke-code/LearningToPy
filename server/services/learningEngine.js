// learningEngine.js
// ─────────────── IMPORTS ──────────────────
// ---MODELS---
const CourseCompletion = require("../models/CourseCompletion");
const Lesson = require("../models/Lesson");
const Module = require("../models/Module");
const LessonQuizProgress = require("../models/LessonQuizProgress");
const LessonCompletion = require("../models/LessonCompletion");
const ModuleCompletion = require("../models/ModuleCompletion");
const QuizAttempt = require("../models/QuizAttempt");
const User = require("../models/User");
const XpTransaction = require("../models/XpTransaction");
// ---SERVICES---
const analytics = require("./analytics");
const gamification = require("./gamification");
const moduleProgress = require("./moduleProgress");
const streakManager = require("./streakManager");
// ---UTILITIES---
const AppError = require("../utils/AppError");
const exerciseHelpers = require("../utils/exerciseHelpers");
const navigation = require("../utils/navigation");
const generalUtils = require("../utils/generalUtils");
const levelUtils = require("../utils/levelUtils");
const quizHelpers = require("../utils/quizHelpers");
// ---SHARED_CONSTANTS---
const {
  XP,
  THRESHOLDS,
  calculateLessonQuizXP,
  getPhaseBonus,
  calculateExerciseXP,
} = require("../../shared/constants/progress.cjs");

// +=============================================+
// |              HELPERS                        |
// +=============================================+

// ───────── PURE HELPERS ─────────

/**
 * Validates a user's code submission against the exercise requirements.
 */
const validateCodeSubmission = (userCode, exercise) => {
  if (!userCode || userCode.trim() === "") {
    return {
      isCorrect: false,
      feedback: "No code submitted",
    };
  }
  if (userCode.trim() === exercise.starterCode?.trim()) {
    return { isCorrect: false, feedback: "Please modify the starter code!" };
  }

  return { isCorrect: true, feedback: "Code accepted (validated in frontend)" };
};

/**
 * Creates a standardized lesson completion record for history tracking.
 */
const createLessonCompletionRecord = (lesson, submissionBody, timestamp) => {
  return {
    lessonId: lesson._id,
    completedAt: timestamp,
    tags: generalUtils.normalizeTags(lesson.tags),
    contentType: lesson.contentType,
    difficulty: lesson.difficulty,
    challengeGroup: lesson.challengeGroup?.toLowerCase(),
    elapsedSeconds: submissionBody.elapsedSeconds,
    attemptNumber: submissionBody.attemptNumber,
    usedHints: !!submissionBody.usedHints,
    linesOfCode: submissionBody.linesOfCode,
    wasOptimal: !!submissionBody.wasOptimalSolution,
  };
};

/**
 * Increments user statistics based on lesson completion performance.
 */
const updateUserStats = (user, lessonRecord, submissionBody) => {
  user.stats = user.stats || {};
  const { elapsedSeconds, usedHints, attemptNumber, wasOptimalSolution } =
    submissionBody;
  const isChallenge = lessonRecord.contentType !== "THEORY";

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

// ───────── PERSISTENCE HELPERS ─────────

/**
 * Bulk-insert XP transactions for a completion event.
 */
const createXpTransactions = async (userId, xpLog) => {
  if (xpLog.length === 0) return [];

  const transactions = xpLog.map((log) => ({
    userId,
    amount: log.amount,
    source: log.source,
    meta: log.meta,
    awardedAt: new Date(),
  }));

  return XpTransaction.insertMany(transactions);
};

/**
 * Record the user's course completion
 */
const recordCourseCompletion = async (user, moduleCount) => {
  const existing = await CourseCompletion.findOne({ userId: user._id });
  if (existing) return null;

  const now = new Date();
  const hofDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await CourseCompletion.create({
    userId: user._id,
    completedAt: now,
    timeToCompleteMs: now.getTime() - user.createdAt.getTime(),
    totalXpAtCompletion: user.xp,
    moduleCount,
    hofEligibleAt: hofDate,
  });

  user.leaderboardStatus = "COMPLETED_PENDING";
  return hofDate;
};

/**
 * Helper: Find user or throw 404 error
 */
const findUserOrThrow = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError("User not found", 404);
  return user;
};

/**
 * Helper: Award XP and recalculate level
 */
const awardUserXp = (user, xpAmount) => {
  user.xp = (user.xp || 0) + xpAmount;
  user.level = Math.floor(user.xp / XP.PER_LEVEL) + 1;
};

/**
 * Helper: Check and record course completion for M20
 */
const checkAndRecordCourseCompletion = async (user, userId, isM20) => {
  if (!isM20) return { courseCompleted: false, hofEligibleAt: null };
  const moduleCount = await ModuleCompletion.countDocuments({ userId });
  const hofDate = await recordCourseCompletion(user, moduleCount);
  return {
    courseCompleted: !!hofDate,
    hofEligibleAt: hofDate || null,
  };
};

// ───────── QUERY HELPERS ─────────

/**
 * Fetch all completion data for a user from collections.
 */
const fetchUserCompletionData = async (userId, { fullDocs = false } = {}) => {
  const [lessonCompletions, moduleCompletions, quizAttempts] =
    await Promise.all([
      LessonCompletion.find({ userId })
        .select(fullDocs ? undefined : "lessonId")
        .lean(),
      ModuleCompletion.find({ userId })
        .select(fullDocs ? undefined : "moduleId")
        .lean(),
      QuizAttempt.find({ userId }).select("moduleId score passed").lean(),
    ]);

  return {
    completedLessons: lessonCompletions.map((lc) =>
      (lc.lessonId?._id || lc.lessonId || lc._id).toString(),
    ),
    completedModules: moduleCompletions.map((mc) =>
      (mc.moduleId?._id || mc.moduleId || mc._id).toString(),
    ),
    quizAttempts,
    lessonCompletions: fullDocs ? lessonCompletions : undefined,
    moduleCompletions: fullDocs ? moduleCompletions : undefined,
  };
};

/**
 * Calculates the current curriculum progress for a user.
 */
const getCurriculumProgressStats = async (user, { Lesson, Module }) => {
  const curriculumModules = await Module.find({
    order: { $gt: 0 },
    isPublished: true,
  }).select("_id");

  const curriculumModuleIds = curriculumModules.map((m) => m._id);

  const totalCurriculumLessons = await Lesson.countDocuments({
    isPublished: true,
    moduleId: { $in: curriculumModuleIds },
  });

  const completedLessonIds = await LessonCompletion.find({
    userId: user._id,
  })
    .select("lessonId")
    .lean();

  const completedIdSet = new Set(
    completedLessonIds.map((lc) => lc.lessonId.toString()),
  );

  const completedCurriculumCount = await Lesson.countDocuments({
    _id: { $in: Array.from(completedIdSet) },
    isPublished: true,
    moduleId: { $in: curriculumModuleIds },
  });

  return {
    totalCurriculumLessons,
    completedCurriculumCount,
  };
};

/**
 * Build the progress payload returned to the client after a completion event.
 */
const buildProgressResponse = async (user, { Lesson, Module }) => {
  const [{ totalCurriculumLessons, completedCurriculumCount }, completionData] =
    await Promise.all([
      getCurriculumProgressStats(user, { Lesson, Module }),
      fetchUserCompletionData(user._id, { fullDocs: true }),
    ]);

  return analytics.formatProgressResponse(
    user.toObject(),
    totalCurriculumLessons,
    completedCurriculumCount,
    null,
    null,
    {
      completedModules: completionData.completedModules,
      completedLessons: completionData.completedLessons,
      lessonCompletions: completionData.lessonCompletions,
      moduleCompletions: completionData.moduleCompletions,
    },
  );
};

// +=============================================+
// |              ORCHESTRATORS                  |
// +=============================================+

const processLessonCompletion = async (user, lesson, submissionBody) => {
  const lessonId = lesson._id.toString();
  const userId = user._id.toString();

  const existingCompletion = await LessonCompletion.findOne({
    userId,
    lessonId,
  });
  if (existingCompletion) {
    return {
      xpIncrease: 0,
      newlyCompleted: false,
      nextLessonId: await navigation.findNextLesson(lesson),
    };
  }

  const module = await Module.findById(lesson.moduleId)
    .select("order phase")
    .lean();
  const moduleOrder = module?.order;
  const isM0 = moduleOrder === 0;
  const isProjectLesson = lesson.contentType === "PROJECT";
  const isFinalModule = moduleOrder === 20 && isProjectLesson;

  let totalXP = 0;
  const xpLog = [];

  if (quizHelpers.hasQuiz(lesson) && !isM0) {
    const quizProgress =
      submissionBody.quizProgress ||
      user.lessonQuizProgress?.find(
        (qp) => qp.lessonId?.toString() === lessonId,
      );

    if (quizProgress) {
      const results = quizHelpers.getQuizResultsForXP(quizProgress, lesson);

      for (const result of results) {
        if (result.correct) {
          const quizXP = calculateLessonQuizXP(result.attempts);
          totalXP += quizXP;

          xpLog.push({
            amount: quizXP,
            source: "LESSON_QUIZ",
            meta: {
              lessonId,
              questionIndex: result.questionIndex,
              attempts: result.attempts,
            },
          });
        }
      }

      const correctCount = results.filter((r) => r.correct).length;
      const score = (correctCount / results.length) * 100;
      if (score >= THRESHOLDS.QUIZ.PASSING_SCORE) {
        totalXP += XP.LESSON_QUIZ.PASSING_BONUS;
        xpLog.push({
          amount: XP.LESSON_QUIZ.PASSING_BONUS,
          source: "LESSON_QUIZ",
          meta: { lessonId, score, passingBonus: true },
        });
      }
    }
  }

  totalXP += XP.LESSON.COMPLETION;
  xpLog.push({
    amount: XP.LESSON.COMPLETION,
    source: "LESSON_COMPLETION",
    meta: { lessonId },
  });

  if (isProjectLesson) {
    totalXP += XP.LESSON.PROJECT_BONUS;
    xpLog.push({
      amount: XP.LESSON.PROJECT_BONUS,
      source: "BONUS",
      meta: { lessonId, reason: "project_lesson" },
    });
  }

  if (isFinalModule) {
    totalXP += XP.SPECIAL.M20_PROJECT_BONUS;
    xpLog.push({
      amount: XP.SPECIAL.M20_PROJECT_BONUS,
      source: "BONUS",
      meta: { lessonId, reason: "capstone_project" },
    });
  }

  if (submissionBody.moduleConfigReward && !isM0) {
    totalXP += submissionBody.moduleConfigReward;
    xpLog.push({
      amount: submissionBody.moduleConfigReward,
      source: "BONUS",
      meta: { lessonId, reason: "module_config_reward" },
    });
  }

  let willAutoComplete = false;
  let autoCompleteModule = null;
  let autoCompleteModuleBonus = 0;

  if (!isM0 && !quizHelpers.hasQuiz(lesson)) {
    const moduleLessons = await Lesson.find({
      moduleId: lesson.moduleId,
      isPublished: true,
    })
      .select("_id")
      .lean();

    const moduleLessonIds = moduleLessons.map((l) => l._id.toString());

    const completedLessonRecords = await LessonCompletion.find({
      userId,
      lessonId: { $in: moduleLessonIds },
    }).lean();

    const completedLessonIds = completedLessonRecords.map((lc) =>
      lc.lessonId.toString(),
    );

    const allOthersComplete = moduleLessonIds
      .filter((id) => id !== lessonId)
      .every((id) => completedLessonIds.includes(id));

    if (allOthersComplete) {
      const fullModule = await Module.findById(lesson.moduleId);
      const moduleHasQuiz = quizHelpers.hasQuiz(fullModule);

      if (!moduleHasQuiz) {
        const existingModuleCompletion = await ModuleCompletion.findOne({
          userId,
          moduleId: fullModule._id,
        });

        if (!existingModuleCompletion) {
          willAutoComplete = true;
          autoCompleteModule = fullModule;

          const modulePhase = fullModule.phase || 1;
          autoCompleteModuleBonus =
            XP.MODULE.COMPLETION_BONUS + getPhaseBonus(modulePhase);

          totalXP += autoCompleteModuleBonus;

          if (fullModule.order === 20) {
            totalXP += XP.SPECIAL.M20_PROJECT_BONUS;
            xpLog.push({
              amount: XP.SPECIAL.M20_PROJECT_BONUS,
              source: "BONUS",
              meta: { lessonId, reason: "capstone_auto_complete" },
            });
          }

          xpLog.push({
            amount: autoCompleteModuleBonus,
            source: "MODULE_COMPLETION_AUTO",
            meta: { moduleId: fullModule._id.toString(), phase: modulePhase },
          });
        }
      }
    }
  }

  awardUserXp(user, totalXP);
  user.completedLessonsCount = (user.completedLessonsCount || 0) + 1;

  await createXpTransactions(userId, xpLog);

  const now = new Date();
  const record = createLessonCompletionRecord(lesson, submissionBody, now);
  await LessonCompletion.create({ userId, ...record });

  let autoCompletedModule = false;
  let courseCompleted = false;
  let hofEligibleAt = null;

  if (willAutoComplete) {
    await ModuleCompletion.create({
      userId,
      moduleId: autoCompleteModule._id,
      completedAt: now,
    });

    user.completedModulesCount = (user.completedModulesCount || 0) + 1;
    autoCompletedModule = true;
  }

  if (autoCompletedModule && autoCompleteModule?.order === 20) {
    const courseResult = await checkAndRecordCourseCompletion(
      user,
      userId,
      true,
    );
    courseCompleted = courseResult.courseCompleted;
    hofEligibleAt = courseResult.hofEligibleAt;
  }

  updateUserStats(user, record, submissionBody);

  return {
    xpIncrease: totalXP,
    newlyCompleted: true,
    nextLessonId: await navigation.findNextLesson(lesson),
    xpBreakdown: xpLog,
    autoCompletedModule,
    courseCompleted,
    hofEligibleAt,
  };
};

const processModuleCompletion = async (user, module, quizResults = []) => {
  const moduleId = module._id.toString();
  const userId = user._id.toString();

  const nextModule = await navigation.findNextModule(module);

  const existingCompletion = await ModuleCompletion.findOne({
    userId,
    moduleId,
  });

  if (existingCompletion) {
    return {
      xpIncrease: 0,
      newlyCompleted: false,
      nextModuleId: nextModule,
      xpBreakdown: [],
      courseCompleted: false,
    };
  }

  const isM0 = module.order === 0;
  const isM20 = module.order === 20;

  let totalXP = 0;
  const xpLog = [];

  if (!isM0 && quizResults.length > 0) {
    const correctCount = quizResults.filter((r) => r.isCorrect).length;
    const quizXP = correctCount * XP.MODULE_QUIZ.CORRECT_ANSWER;
    totalXP += quizXP;
    xpLog.push({
      amount: quizXP,
      source: "MODULE_QUIZ",
      meta: { moduleId, correct: correctCount, total: quizResults.length },
    });

    totalXP += XP.MODULE_QUIZ.COMPLETION_BONUS;
    xpLog.push({
      amount: XP.MODULE_QUIZ.COMPLETION_BONUS,
      source: "MODULE_QUIZ",
      meta: { moduleId, completionBonus: true },
    });

    if (correctCount === quizResults.length) {
      totalXP += XP.MODULE_QUIZ.PERFECT_SCORE_BONUS;
      xpLog.push({
        amount: XP.MODULE_QUIZ.PERFECT_SCORE_BONUS,
        source: "MODULE_QUIZ",
        meta: { moduleId, perfectScore: true },
      });
    }
  }

  const completionBonus =
    XP.MODULE.COMPLETION_BONUS + getPhaseBonus(module.phase);
  totalXP += completionBonus;
  xpLog.push({
    amount: completionBonus,
    source: "MODULE_COMPLETION",
    meta: { moduleId, phase: module.phase },
  });

  if (isM20) {
    totalXP += XP.SPECIAL.M20_PROJECT_BONUS;
    xpLog.push({
      amount: XP.SPECIAL.M20_PROJECT_BONUS,
      source: "BONUS",
      meta: { moduleId, reason: "capstone_completion" },
    });
  }

  if (isM0) {
    totalXP += XP.SPECIAL.M0_COMPLETION;
    xpLog.push({
      amount: XP.SPECIAL.M0_COMPLETION,
      source: "MODULE_COMPLETION",
      meta: { moduleId, reason: "tutorial_completion" },
    });
  }

  if (module.xpReward && !isM0) {
    totalXP += module.xpReward;
    xpLog.push({
      amount: module.xpReward,
      source: "BONUS",
      meta: { moduleId, reason: "module_config_reward" },
    });
  }

  await ModuleCompletion.create({
    userId,
    moduleId: module._id,
    completedAt: new Date(),
  });
  user.completedModulesCount = (user.completedModulesCount || 0) + 1;

  awardUserXp(user, totalXP);
  await createXpTransactions(userId, xpLog);

  const result = {
    xpIncrease: totalXP,
    newlyCompleted: true,
    nextModuleId: nextModule,
    xpBreakdown: xpLog,
    courseCompleted: false,
  };

  if (isM20) {
    const courseResult = await checkAndRecordCourseCompletion(
      user,
      userId,
      isM20,
    );
    if (courseResult.courseCompleted) {
      result.courseCompleted = true;
      result.hofEligibleAt = courseResult.hofEligibleAt;
    }
  }

  return result;
};

const isLessonFullyCompleted = (
  lesson,
  quizProgress,
  exercisePassed,
  forceComplete = false,
) => {
  const lessonHasQuiz = quizHelpers.hasQuiz(lesson);
  const lessonHasExercise = exerciseHelpers.hasExercise(lesson);

  if (forceComplete) return true;

  if (!lessonHasQuiz && !lessonHasExercise) {
    return lesson.contentType === "THEORY";
  }

  const quizDone = lessonHasQuiz
    ? quizHelpers.isQuizCompleted(quizProgress, lesson)
    : true;

  const exerciseDone = lessonHasExercise ? exercisePassed : true;

  return quizDone && exerciseDone;
};

const submitLessonAttempt = async (userId, lessonId, submissionBody) => {
  const {
    answer,
    code,
    questionIndex = 0,
    validationResult,
    isCorrect = false,
    usedHints = false,
    elapsedSeconds,
    wasOptimalSolution,
    moduleConfigReward,
  } = submissionBody;

  const lesson = await Lesson.findById(lessonId).populate(
    "moduleId",
    "order phase",
  );
  if (!lesson) throw new AppError("Lesson not found", 404);

  const user = await findUserOrThrow(userId);

  const exerciseProgress = await exerciseHelpers.getOrCreateExerciseProgress(
    userId,
    lessonId,
    lesson,
  );
  const quizProgress = await quizHelpers.getOrCreateQuizProgress(
    userId,
    lessonId,
    lesson,
  );

  const isExerciseSubmission =
    exerciseHelpers.hasExercise(lesson) && code !== undefined;
  const isQuizSubmission = quizHelpers.hasQuiz(lesson) && answer !== undefined;
  const isStatusCheckSubmission = !isExerciseSubmission && !isQuizSubmission;
  const lessonCompletesByStatusCheck =
    !exerciseHelpers.hasExercise(lesson) && !quizHelpers.hasQuiz(lesson);

  let feedback = validationResult?.feedback || "Great job!";
  let isCorrectForThisAction = false;
  let exerciseJustPassed = false;

  if (isExerciseSubmission) {
    if (!code || code.trim() === "")
      throw new AppError("No code submitted", 400);

    const serverValidation = validateCodeSubmission(code, lesson.exercise);
    if (!serverValidation.isCorrect) {
      return {
        message: serverValidation.feedback,
        payload: {
          isCorrect: false,
          feedback: serverValidation.feedback,
          completed: false,
          xpEarned: 0,
        },
      };
    }

    isCorrectForThisAction = isCorrect;
    const wasAlreadyPassed = exerciseProgress?.passed === true;

    await exerciseHelpers.recordExerciseAttempt(exerciseProgress, {
      passed: isCorrect,
      code,
      usedHints,
      wasOptimal: wasOptimalSolution,
      elapsedSeconds,
    });

    exerciseJustPassed = isCorrect && !wasAlreadyPassed;
    feedback = validationResult?.feedback || "Code submitted successfully";
  } else if (isQuizSubmission) {
    const currentQuestion = lesson.quiz[questionIndex];
    if (!currentQuestion) throw new AppError("Invalid question index", 400);

    isCorrectForThisAction = answer === currentQuestion.correctAnswer;
    if (isCorrectForThisAction) {
      feedback = `Correct! ${currentQuestion.explanation || ""}`;
      await quizHelpers.updateQuizProgress(
        quizProgress,
        questionIndex,
        true,
        lesson,
      );
    } else {
      feedback = `Try again! ${currentQuestion.explanation || ""}`;
      await quizHelpers.updateQuizProgress(
        quizProgress,
        questionIndex,
        false,
        lesson,
      );
    }
  }

  const existingLessonCompletion = await LessonCompletion.findOne({
    userId,
    lessonId,
  });
  const exercisePassed = exerciseProgress?.passed || false;

  const completed =
    !!existingLessonCompletion ||
    isLessonFullyCompleted(
      lesson,
      quizProgress,
      exercisePassed,
      isStatusCheckSubmission && lessonCompletesByStatusCheck,
    );

  if (completed) {
    const freshQuizProgress = await LessonQuizProgress.findOne({
      userId,
      lessonId,
    });
    const submissionData = {
      ...submissionBody,
      moduleConfigReward,
      quizProgress: freshQuizProgress,
    };

    const completionResult = await processLessonCompletion(
      user,
      lesson,
      submissionData,
    );

    const badgesUnlockedDetails =
      await gamification.evaluateAndApplyBadges(user);

    await streakManager.trackCompletion(user);
    await user.save();
    await gamification.checkLeaderboardBadges(user, User);

    const progressData = await buildProgressResponse(user, { Lesson, Module });

    return {
      message: "Success!",
      payload: {
        isCorrect: isCorrectForThisAction,
        feedback,
        completed: true,
        xpEarned: completionResult.xpIncrease,
        xpBreakdown: completionResult.xpBreakdown,
        progress: progressData,
        badgesUnlocked: badgesUnlockedDetails,
        nextLessonId: completionResult.nextLessonId,
      },
    };
  }

  let partialXPEarned = 0;
  let xpSource = null;
  let xpMeta = null;

  if (!existingLessonCompletion) {
    if (isExerciseSubmission && exerciseJustPassed) {
      const submissionCount = exerciseProgress?.attemptCount || 1;
      partialXPEarned = calculateExerciseXP(submissionCount, submissionCount);
      xpSource = "EXERCISE";
      xpMeta = { lessonId, submissionCount };
    } else if (isQuizSubmission && isCorrectForThisAction) {
      const attempts = quizHelpers.getQuestionAttempts(
        quizProgress,
        questionIndex,
      );
      partialXPEarned = quizHelpers.calculateQuizAnswerXP(attempts);
      xpSource = "LESSON_QUIZ";
      xpMeta = { lessonId, questionIndex, attempts };
    }

    if (partialXPEarned > 0 && xpSource) {
      user.xp = (user.xp || 0) + partialXPEarned;
      await XpTransaction.create({
        userId: user._id,
        amount: partialXPEarned,
        source: xpSource,
        meta: xpMeta,
        awardedAt: new Date(),
      });
      await user.save();
    }
  }

  return {
    message: isCorrectForThisAction ? "Success!" : "Keep trying!",
    payload: {
      isCorrect: isCorrectForThisAction,
      feedback,
      completed: false,
      xpEarned: partialXPEarned,
    },
  };
};

const submitModuleQuizAttempt = async (userId, moduleId, answers = {}) => {
  const module = await Module.findById(moduleId);
  if (!module) throw new AppError("Module not found.", 404);

  if (!module.moduleQuiz?.questions?.length) {
    throw new AppError("Module quiz not found.", 404);
  }

  const user = await findUserOrThrow(userId);

  const { completedLessons } = await fetchUserCompletionData(userId);

  const moduleLessons = await Lesson.find({
    moduleId: moduleId,
    isPublished: true,
  });

  const completedLessonsInModule = moduleProgress.getModuleLessonCompletion(
    moduleLessons,
    completedLessons,
  );

  if (completedLessonsInModule !== moduleLessons.length) {
    throw new AppError(
      "Complete all lessons before taking the module quiz",
      403,
    );
  }

  const questions = module.moduleQuiz.questions;
  let correctCount = 0;
  const results = [];

  questions.forEach((question) => {
    const userAnswer = answers[question._id.toString()];
    const isCorrect = userAnswer === question.correctAnswer;
    if (isCorrect) correctCount++;

    results.push({
      questionId: question._id,
      question: question.question,
      userAnswer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
    });
  });

  const totalQuestions = questions.length;
  const score = Math.round((correctCount / totalQuestions) * 100);
  const passingScore = module.moduleQuiz.settings?.passingScore || 70;
  const passed = score >= passingScore;

  await QuizAttempt.create({
    userId,
    moduleId: module._id,
    attemptedAt: new Date(),
    score,
    passed,
    answers: results,
  });

  let xpIncrease = 0;
  let moduleCompletedNow = false;
  let nextModuleId = null;
  let badgesUnlockedDetails = [];
  let completionResult = null;

  if (passed) {
    completionResult = await processModuleCompletion(user, module, results);

    xpIncrease = completionResult.xpIncrease;
    moduleCompletedNow = completionResult.newlyCompleted;
    nextModuleId = completionResult.nextModuleId;

    badgesUnlockedDetails = await gamification.evaluateAndApplyBadges(user);

    await streakManager.trackCompletion(user);
  }

  await user.save();

  if (passed) await gamification.checkLeaderboardBadges(user, User);

  const progressData = await buildProgressResponse(user, { Lesson, Module });

  return {
    message: passed ? "Quiz passed!" : "Quiz completed",
    payload: {
      passed,
      score,
      passingScore,
      correctAnswers: correctCount,
      totalQuestions,
      results,
      xpEarned: xpIncrease,
      xpBreakdown: completionResult?.xpBreakdown,
      moduleCompleted: moduleCompletedNow,
      progress: progressData,
      badgesUnlocked: badgesUnlockedDetails,
      nextModuleId,
    },
  };
};

// +=============================================+
// |         USER PROGRESS & DASHBOARD           |
// +=============================================+

const getUserProgressSummary = async (userId) => {
  const user = await User.findById(userId).lean();
  if (!user) return null;

  // Reusing fetchUserCompletionData helper
  const completionData = await fetchUserCompletionData(userId);
  const completedLessonIds = completionData.completedLessons;
  const completedModuleIds = completionData.completedModules;

  const modules = await Module.find({ isPublished: true })
    .select("_id order title")
    .sort("order")
    .lean();

  const moduleOrderMap = await levelUtils.getModuleOrderMap();

  let currentModuleData = null;
  const moduleIds = modules.map((m) => m._id);
  const allModuleLessons = await Lesson.find({
    moduleId: { $in: moduleIds },
    isPublished: true,
  })
    .select("_id moduleId")
    .lean();

  const lessonsByModule = {};
  allModuleLessons.forEach((l) => {
    const key = l.moduleId.toString();
    if (!lessonsByModule[key]) lessonsByModule[key] = [];
    lessonsByModule[key].push(l);
  });

  for (const module of modules) {
    if (module.order === 0) continue;
    if (completedModuleIds.includes(module._id.toString())) continue;

    const lessons = lessonsByModule[module._id.toString()] || [];
    const completedInModule = lessons.filter((l) =>
      completedLessonIds.includes(l._id.toString()),
    ).length;

    currentModuleData = {
      order: module.order,
      title: module.title,
      lessonCount: lessons.length,
      lessonsCompleted: completedInModule,
    };
    break;
  }

  if (!currentModuleData && completedModuleIds.length >= 20) {
    currentModuleData = null;
  }

  const userWithArrays = {
    ...user,
    completedLessons: completedLessonIds,
    completedModules: completedModuleIds,
    completedLessonsCount: completedLessonIds.length,
    completedModulesCount: completedModuleIds.length,
  };

  const { totalCurriculumLessons, completedCurriculumCount } =
    await getCurriculumProgressStats(userWithArrays, { Lesson, Module });

  return {
    userWithArrays,
    totalCurriculumLessons,
    completedCurriculumCount,
    currentModuleData,
    moduleOrderMap,
  };
};

// +=============================================+
// |      HALL OF FAME & COURSE COMPLETION       |
// +=============================================+

const getHallOfFameMembers = async (page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [inductedMembers, totalInducted] = await Promise.all([
    CourseCompletion.find({ hofJoinedAt: { $ne: null } })
      .sort({ completedAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: "userId",
        select: "username privacySettings createdAt ageBracket",
        match: { ageBracket: { $in: ["16-17", "18+"] } },
      })
      .lean(),
    CourseCompletion.countDocuments({ hofJoinedAt: { $ne: null } }),
  ]);

  const filteredMembers = inductedMembers.filter((member) => member.userId);

  const members = filteredMembers.map((member, index) => {
    const user = member.userId || {};
    return {
      rank: skip + index + 1,
      displayName: user.privacySettings?.showUsernameOnLeaderboards
        ? user.username
        : `Learner #${(user._id || member.userId).toString().slice(-6)}`,
      isAnonymous: !user.privacySettings?.showUsernameOnLeaderboards,
      completedAt: member.completedAt,
      timeToCompleteMs: member.timeToCompleteMs,
      timeToCompleteDays: Math.round(member.timeToCompleteMs / 86400000),
      inductedAt: member.hofJoinedAt,
      earlyOptIn: member.earlyOptIn,
    };
  });

  const totalPages = Math.ceil(totalInducted / limit);

  return {
    members,
    totalInducted,
    page,
    totalPages,
  };
};

const optInUserToHoF = async (userId) => {
  const completion = await CourseCompletion.findOne({ userId });
  if (!completion) {
    throw new AppError("No course completion record found.", 404);
  }

  if (completion.hofJoinedAt) {
    throw new AppError("You are already in the Hall of Fame.", 400);
  }

  const now = new Date();
  const inductedCount = await CourseCompletion.countDocuments({
    hofJoinedAt: { $ne: null },
  });

  completion.hofJoinedAt = now;
  completion.earlyOptIn = true;
  completion.earlyOptInAt = now;
  await completion.save();

  await User.findByIdAndUpdate(userId, {
    leaderboardStatus: "HOF",
    $addToSet: { badges: "hof" },
  });

  return {
    hofRank: inductedCount + 1,
    inductedAt: now,
  };
};

const getCourseStatusForUser = async (userId) => {
  const completion = await CourseCompletion.findOne({ userId }).lean();

  if (!completion) {
    return {
      courseCompleted: false,
      hofJoinedAt: null,
      hofEligibleAt: null,
      modulesCompleted: 0,
    };
  }

  let rank = null;
  if (completion.hofJoinedAt) {
    rank =
      (await CourseCompletion.countDocuments({
        hofJoinedAt: { $ne: null },
        completedAt: { $lt: completion.completedAt },
      })) + 1;
  }

  return {
    courseCompleted: true,
    completedAt: completion.completedAt,
    hofEligibleAt: completion.hofEligibleAt,
    hofJoinedAt: completion.hofJoinedAt || null,
    earlyOptIn: completion.earlyOptIn || false,
    rank,
    timeToCompleteDays: completion.timeToCompleteMs
      ? Math.round(completion.timeToCompleteMs / 86400000)
      : null,
  };
};

// ───────── EXPORTS ────────────

module.exports = {
  // Helpers
  validateCodeSubmission,
  fetchUserCompletionData,
  getCurriculumProgressStats,
  // Orchestrators
  processLessonCompletion,
  processModuleCompletion,
  isLessonFullyCompleted,
  submitLessonAttempt,
  submitModuleQuizAttempt,
  // User Progress
  getUserProgressSummary,
  // HoF
  getHallOfFameMembers,
  optInUserToHoF,
  getCourseStatusForUser,
};
