// LessonContent.jsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Lightbulb } from "lucide-react";
import { useTheme } from "../../context";
import { CodeBlock, QuizComponent, ExerciseComponent } from "../lesson";

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
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl font-bold text-gray-800 mb-4 mt-6">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg font-semibold text-gray-800 mb-2 mt-4">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-gray-700 mb-4 leading-relaxed">{children}</p>
            ),
            code: ({ children, className }) => {
              const isInline = !className;
              if (isInline) {
                return (
                  <code className="bg-gray-100 text-red-600 px-1 py-0.5 rounded text-sm font-mono">
                    {children}
                  </code>
                );
              }

              const language = className?.replace("language-", "") || "python";
              return (
                <CodeBlock
                  code={String(children).replace(/\n$/, "")}
                  language={language}
                  isUserCode={false}
                />
              );
            },
            ul: ({ children }) => (
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="pl-2">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
                {children}
              </blockquote>
            ),
            a: ({ children, href }) => (
              <a
                href={href}
                className="text-blue-600 hover:text-blue-800 underline transition"
                target="_blank"
                rel="noopener noreferrer"
              >
                {children}
              </a>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-gray-800">
                {children}
              </strong>
            ),
            em: ({ children }) => (
              <em className="italic text-gray-700">{children}</em>
            ),
            // ========== TABLE COMPONENTS ==========
            table: ({ children }) => (
              <div className="overflow-x-auto my-8">
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg shadow-sm">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-gray-50">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="[&>tr:nth-child(even)]:bg-gray-50">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-gray-50 transition-colors">{children}</tr>
            ),
            th: ({ children }) => (
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase tracking-wider border-b border-gray-300 bg-gray-100">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-300">
                {children}
              </td>
            ),
            // ======================================
          }}
        >
          {lesson.content}
        </ReactMarkdown>
      </div>

      {/* Code Example */}
      {lesson.codeExample && (
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-4">
            <Lightbulb className="text-blue-600" size={20} />
            <h3 className="text-lg font-semibold text-gray-800">Example</h3>
          </div>
          <CodeBlock code={lesson.codeExample.code} />
          <p className="text-gray-600 text-sm mt-2">
            {lesson.codeExample.explanation}
          </p>
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
