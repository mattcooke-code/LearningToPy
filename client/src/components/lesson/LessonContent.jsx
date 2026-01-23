// LessonContent.jsx
import { Lightbulb } from "lucide-react";
import { useTheme } from "../../context";
import { QuizComponent, ExerciseComponent } from "../lesson";
import { MarkdownRenderer } from "../ui";

const LessonContent = ({
  lesson,
  isReviewMode,
  onAnswerSubmit,
  onCodeSubmit,
  markTheoryComplete,
  isSubmitting,
  onQuizComplete,
  exerciseCompleted,
  setExerciseCompleted,
  quizCompleted,
  setQuizCompleted,
}) => {
  const { isCodeDark } = useTheme();

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
      <div className="prose prose-lg max-w-none">
        <MarkdownRenderer content={lesson.content} />
      </div>

      {/* Code Example */}
      {lesson.codeExample && (
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Example</h3>
          </div>
          <CodeBlock code={lesson.codeExample.code} />
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
      {lesson.isCompleted && !isReviewMode && (
        <div className="mt-12 p-1 border-t border-gray-100 pt-8">
          <div className="bg-gray-50 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Lesson Complete! 🎉
              </h3>
              <p className="text-gray-600">
                You've mastered this content. What's next?
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Theory Lesson Completion */}
      {lesson.contentType === "theory" &&
        !lesson.isCompleted &&
        !isReviewMode && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-green-800 mb-2">
              Ready to mark this lesson complete?
            </h3>
            <p className="text-green-700 mb-4">
              You'll earn {lesson.xpReward} XP for completing this lesson.
            </p>
            <button
              onClick={markTheoryComplete}
              disabled={isSubmitting}
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-green-300 transition"
            >
              {isSubmitting ? "Marking..." : "Mark Lesson Complete"}
            </button>
          </div>
        )}
    </div>
  );
};

export default LessonContent;
