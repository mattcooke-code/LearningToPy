// contentController.js
const Module = require("../models/Module");
const Lesson = require("../models/Lesson");
const User = require("../models/User");
const AppError = require("../utils/AppError");
const catchAsync = require("../utils/catchAsync");
const {
  validateCodeSubmission,
  createLessonCompletionRecord,
  updateUserStats,
} = require("../utils/contentHelpers");
const {
  streakLogic,
  formatProgressResponse,
  MODULE_XP_BONUS,
  calculateModuleLessonProgress,
} = require("../utils/progressHelpers");
const { evaluateBadges } = require("../utils/badgeLogic");
const { sendJsonResponse } = require("../utils/responseHelpers");

const getAllModules = catchAsync(async (req, res, next) => {
  const userId = req.userId;

  const modules = await Module.find({ isPublished: true })
    .populate("prerequisites", "title order")
    .sort("order")
    .lean();

  const user = await User.findById(userId).select(
    "completedLessons completedModules"
  );

  const modulesWithProgress = await Promise.all(
    modules.map(async (module) => {
      const lessons = await Lesson.find({
        moduleId: module._id,
        isPublished: true,
      });
      const completedLessonsInModule = lessons.filter((lesson) =>
        user.completedLessons.includes(lesson._id.toString())
      ).length;

      const moduleLessonProgress = calculateModuleLessonProgress(
        completedLessonsInModule,
        lessons.length
      );

      const isCompleted = user.completedModules.includes(module._id.toString());

      console.log(
        `Module ${module.title}: ${completedLessonsInModule}/${lessons.length} lessons, Completed: ${isCompleted}`
      );

      // Check if prerequisites are completed
      const isLocked =
        module.prerequisites &&
        module.prerequisites.length > 0 &&
        module.prerequisites.some((prereq) => {
          const prereqCompleted = user.completedModules.includes(
            prereq._id.toString()
          );
          console.log(`Prerequisite ${prereq.title}: ${prereqCompleted}`);
          return !prereqCompleted;
        });

      return {
        ...module,
        isCompleted,
        moduleLessonProgress,
        isLocked: !!isLocked,
        lessonCount: lessons.length,
      };
    })
  );

  sendJsonResponse(res, 200, "Modules fetched successfully", {
    data: modulesWithProgress,
  });
});

const getModuleLessons = catchAsync(async (req, res, next) => {
  const { moduleId } = req.params;
  const userId = req.userId;

  const module = await Module.findById(moduleId);
  if (!module) {
    return next(new AppError("Module not found", 404));
  }

  const lessons = await Lesson.find({ moduleId, isPublished: true })
    .sort("order")
    .select("-exercise.solution -quiz.correctAnswer")
    .lean();

  const user = await User.findById(userId).select("completedLessons");

  const lessonsWithProgress = lessons.map((lesson) => ({
    ...lesson,
    isCompleted: user.completedLessons.includes(lesson._id.toString()),
    isLocked: false,
  }));

  sendJsonResponse(res, 200, "Lessons fetched successfully", {
    data: {
      module: {
        title: module.title,
        description: module.description,
        icon: module.icon,
      },
      lessons: lessonsWithProgress,
    },
  });
});

const getLessonContent = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const userId = req.userId;

  const lesson = await Lesson.findById(lessonId).lean();
  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  // Omit answers
  const safeLesson = { ...lesson };
  if (safeLesson.exercise) {
    delete safeLesson.exercise.solution;
  }
  if (safeLesson.quiz) {
    delete safeLesson.quiz.correctAnswer;
  }

  const user = await User.findById(userId).select("completedLessons");
  const isCompleted = user.completedLessons.includes(lessonId);

  sendJsonResponse(res, 200, "Lesson content fetched successfully", {
    data: { ...safeLesson, isCompleted },
  });
});

const submitLesson = catchAsync(async (req, res, next) => {
  const { lessonId } = req.params;
  const userId = req.userId;
  const submissionBody = req.body;
  const { answer, code } = submissionBody;

  const lesson = await Lesson.findById(lessonId);
  if (!lesson) {
    return next(new AppError("Lesson not found", 404));
  }

  let isCorrect = false;
  let feedback = "";

  if (lesson.exercise && code) {
    const validationResult = validateCodeSubmission(code, lesson.exercise);
    isCorrect = validationResult.isCorrect;
    feedback = validationResult.feedback;
  } else if (lesson.quiz && answer !== undefined) {
    isCorrect = answer === lesson.quiz.correctAnswer;
    feedback = isCorrect ? "Correct! " + lesson.quiz.explanation : "Try again!";
  }

  let moduleCompletedNow = false;
  let xpIncrease = 0;
  let badgesUnlockedDetails = [];
  let nextLessonId = null;

  if (isCorrect || lesson.contentType === "theory") {
    const user = await User.findById(userId);

    // Add to completed lessons
    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);

      xpIncrease = lesson.xpReward || 0;

      const completionTimestamp = new Date();

      // Calculate next lesson
      try {
        if (lesson.nextLessonId) {
          nextLessonId = lesson.nextLessonId;
        } else {
          const nextLesson = await Lesson.findOne({
            moduleId: lesson.moduleId,
            order: lesson.order + 1,
            isPublished: true,
          });
          if (nextLesson) {
            nextLessonId = nextLesson._id;
          }
        }
        console.log(`➡️ Next lesson ID: ${nextLessonId}`);
      } catch (error) {
        console.error("Error calculating next lesson:", error);
      }

      // Check if all lessons in the module are completed
      const moduleLessons = await Lesson.find({
        moduleId: lesson.moduleId,
        isPublished: true,
      });

      const completedLessonsInModule = moduleLessons.filter((moduleLesson) =>
        user.completedLessons.includes(moduleLesson._id.toString())
      ).length;

      // If all lessons complete, mark module as complete
      if (completedLessonsInModule === moduleLessons.length) {
        const currentModuleIdString = lesson.moduleId.toString();
        if (!user.completedModules.includes(currentModuleIdString)) {
          user.completedModules.push(currentModuleIdString);
          xpIncrease += MODULE_XP_BONUS;
          moduleCompletedNow = true;
          console.log(`Module ${lesson.moduleId} marked as completed!`);

          if (!Array.isArray(user.moduleCompletionHistory)) {
            user.moduleCompletionHistory = [];
          }
          user.moduleCompletionHistory.push({
            moduleId: lesson.moduleId,
            completedAt: completionTimestamp,
          });
        }
      }

      user.xp += xpIncrease;

      const { streakAction, value: newStreakValue } = streakLogic(
        user.lastActiveDate
      );
      if (newStreakValue !== null) {
        if (streakAction === "$inc") {
          user.streak += newStreakValue;
        } else if (streakAction === "$set") {
          user.streak = newStreakValue;
        }
      }
      user.lastActiveDate = new Date();

      if (!Array.isArray(user.lessonCompletionHistory)) {
        user.lessonCompletionHistory = [];
      }

      const lessonRecord = createLessonCompletionRecord(
        lesson,
        submissionBody,
        completionTimestamp
      );

      user.lessonCompletionHistory.push(lessonRecord);

      updateUserStats(user, lessonRecord, submissionBody);

      // ===== REMINDER: REFACTOR BADGE LOGIC INTO UTILS FUNCTION =======
      const { newlyUnlocked, unlockedDetails } = await evaluateBadges({
        user,
        context: {
          type: "lesson_completion",
          lessonId,
          moduleCompleted: moduleCompletedNow,
        },
      });

      if (Array.isArray(newlyUnlocked) && newlyUnlocked.length > 0) {
        user.badges = Array.isArray(user.badges) ? user.badges : [];
        newlyUnlocked.forEach((badgeId) => {
          if (!user.badges.includes(badgeId)) {
            user.badges.push(badgeId);
          }
        });
        badgesUnlockedDetails = unlockedDetails;
      }

      await user.save();
    }
    const progressData = formatProgressResponse(user.toObject());

    sendJsonResponse(res, 200, "Lesson Completed!", {
      data: {
        isCorrect,
        feedback,
        completed: true,
        xpEarned: xpIncrease, // Send the total XP earned (lesson + bonus)
        progress: progressData, // Send updated progress data
        moduleCompleted: moduleCompletedNow, // <-- Send status to frontend
        badgesUnlocked: badgesUnlockedDetails,
        nextLessonId,
      },
    });
    return; // End here to prevent double response
  }

  sendJsonResponse(
    res,
    200,
    isCorrect ? "Lesson Completed!" : "Check your answer.",
    {
      data: {
        isCorrect,
        feedback,
        completed: isCorrect || lesson.contentType === "theory",
        xpEarned: isCorrect ? lesson.xpReward : 0,
        nextLessonId,
      },
    }
  );
});

const fixModuleProgress = catchAsync(async (req, res, next) => {
  // NOTE: In a real app, you would verify the user making this call is an admin,
  // but for a quick fix, we'll use the authenticated user's ID.
  const userId = req.userId;

  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const modules = await Module.find({ isPublished: true }).lean();
  let modulesFixed = [];

  for (const module of modules) {
    const moduleIdString = module._id.toString();

    // Skip modules already marked as completed
    if (user.completedModules.includes(moduleIdString)) {
      continue;
    }

    // 1. Get all published lessons for the module
    const lessons = await Lesson.find({
      moduleId: module._id,
      isPublished: true,
    });

    if (lessons.length === 0) continue;

    // 2. Count completed lessons by the user
    const completedLessonsInModule = lessons.filter((lesson) =>
      user.completedLessons.includes(lesson._id.toString())
    ).length;

    // 3. Check for 100% completion
    if (completedLessonsInModule === lessons.length) {
      // FIX: Mark module as completed and apply XP bonus
      user.completedModules.push(moduleIdString);
      user.xp += module.xpReward; // Assuming module.xpReward is the bonus XP
      if (!Array.isArray(user.moduleCompletionHistory)) {
        user.moduleCompletionHistory = [];
      }
      user.moduleCompletionHistory.push({
        moduleId: module._id,
        completedAt: new Date(),
      });
      modulesFixed.push(module.title);
    }
  }

  if (modulesFixed.length > 0) {
    await user.save();
    console.log(
      `✅ Progress Fixed for user ${userId}. Modules completed: ${modulesFixed.join(
        ", "
      )}`
    );
  }

  sendJsonResponse(res, 200, "Module progress check completed", {
    data: { fixed: modulesFixed.length > 0, modules: modulesFixed },
  });
});

module.exports = {
  getAllModules,
  getModuleLessons,
  getLessonContent,
  submitLesson,
  fixModuleProgress,
};
