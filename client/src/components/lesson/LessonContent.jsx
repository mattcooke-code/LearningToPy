// LessonContent.jsx
import { Lightbulb } from "lucide-react";
import { useTheme } from "../../context";
import { QuizComponent, ExerciseComponent, CodeBlock } from "../lesson";
import {
  CodeThemeToggle,
  MarkdownRenderer,
  PythonSyntaxHighlighter,
} from "../ui";
import { CheckCircle } from "lucide-react";

const LessonContent = ({
  lesson,
  isReviewMode,
  onAnswerSubmit,
  onCodeSubmit,
  markTheoryComplete,
  isSubmitting,
  onQuizComplete,
  lessonId,
  exerciseCompleted,
  setExerciseCompleted,
  quizCompleted,
  setQuizCompleted,
}) => {
  const { isCodeDark } = useTheme();

  const getModuleNumber = () => {
    if (lesson.moduleNumber) {
      return lesson.moduleNumber;
    }

    if (lesson.module?.order !== undefined) {
      return `M${lesson.module.order}`;
    }

    console.warn(
      `Module order not found for lesson: ${lesson}, defaulting to M0`,
    );
    return "M0";
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-6">
      <div className="prose prose-lg max-w-none">
        <MarkdownRenderer
          content={lesson.content}
          moduleId={getModuleNumber()}
        />
      </div>

      {/* Code Example */}
      {lesson.codeExample && (
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Example</h3>
          </div>
          <CodeBlock code={lesson.codeExample.code} language="python" />
          <div className="text-gray-600 text-sm mt-2">
            <MarkdownRenderer content={lesson.codeExample.explanation} />
          </div>
        </div>
      )}

      {/* Interactive Components */}

      {lesson.exercise && (
        <ExerciseComponent
          exercise={lesson.exercise}
          onCodeSubmit={onCodeSubmit}
          lessonId={lessonId}
          isReviewMode={isReviewMode}
          solution={lesson.exercise.solution}
        />
      )}

      {lesson.quiz && Array.isArray(lesson.quiz) && lesson.quiz.length > 0 && (
        <QuizComponent
          quizArray={lesson.quiz}
          lessonId={lesson._id}
          onAnswerSubmit={onAnswerSubmit}
          onQuizComplete={onQuizComplete}
          isModuleQuiz={false}
        />
      )}

      {/* Post-Completion Navigation */}

      {lesson.isCompleted && (
        <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-800 rounded-full text-green-600 dark:text-green-200">
              <CheckCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                Lesson Mastered! 🎉
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                You've completed this content. Ready for the next challenge?
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Theory Lesson Completion */}
      {lesson.contentType === "theory" &&
        !lesson.quiz &&
        !lesson.isCompleted &&
        !isReviewMode && (
          <div className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-2">
              Ready to mark this lesson complete?
            </h3>
            <p className="text-green-700 dark:text-green-400 mb-4">
              You'll earn {lesson.xpReward} XP for completing this lesson.
            </p>
            <button
              onClick={markTheoryComplete}
              disabled={isSubmitting}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 disabled:bg-green-300 dark:disabled:bg-green-800 transition"
            >
              {isSubmitting ? "Marking..." : "Mark Lesson Complete"}
            </button>
          </div>
        )}
    </div>
  );
};

export default LessonContent;
