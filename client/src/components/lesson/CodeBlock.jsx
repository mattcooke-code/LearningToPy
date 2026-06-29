// CodeBlock.jsx
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../../context";
import { CodeThemeToggle, PythonSyntaxHighlighter } from "../ui";
import { Check, Copy } from "lucide-react";

/**
 * @fileoverview
 * Static code display component with syntax highlighting and copy functionality.
 * This component provides a clean, theme-aware code block display with Python syntax
 * highlighting, copy-to-clipboard functionality, and multi-language support. Features
 * visual feedback for copy actions, theme integration, and responsive design for
 * various code content types.
 */

/**
 * Static code display component with syntax highlighting and copy functionality.
 *
 * This component renders code blocks with professional syntax highlighting for Python
 * and fallback rendering for other languages. Features include one-click copy functionality
 * with visual feedback, theme-aware styling, and integration with the platform's theme
 * system. The component is optimized for displaying code examples, solutions, and
 * educational content throughout the learning platform.
 **/

const CodeBlock = ({ code, language = "python" }) => {
  const { isCodeDark } = useTheme();
  const [copied, setCopied] = useState(false);
  const timerRef = useRef(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div
      className={`rounded-lg p-4 my-4 overflow-x-auto transition-colors duration-200 ${
        isCodeDark
          ? "bg-gray-900 border border-gray-700"
          : "bg-gray-100 border border-gray-300"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span
          className={`text-sm font-mono ${isCodeDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {language}
        </span>
        <div className="flex items-center space-x-3">
          <CodeThemeToggle />
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-2 py-1 rounded transition-all duration-200 ${
              copied
                ? "text-green-400 bg-green-500/10"
                : isCodeDark
                  ? "text-gray-300 hover:bg-gray-500/10"
                  : "text-gray-600 hover:bg-gray-500/10"
            }`}
          >
            {copied ? (
              <>
                <Check size={14} /> <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy size={14} /> <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {language.toLowerCase() === "python" ||
      language.toLowerCase() === "py" ? (
        <PythonSyntaxHighlighter code={code} isDark={isCodeDark} />
      ) : (
        <pre
          className={`text-sm font-mono whitespace-pre-wrap ${isCodeDark ? "text-green-400" : "text-gray-800"}`}
        >
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
};

export default CodeBlock;
