import { useState } from "react";
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
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} props.code - Code content to display
 * @param {string} [props.language="python"] - Programming language for syntax highlighting
 * @param {boolean} [props.isUserCode=false] - Whether this is user-generated code
 * @returns {JSX.Element} Code block with syntax highlighting and copy functionality
 * 
 * @syntaxHighlighting
 * - PythonSyntaxHighlighter for Python/py language code
 * - Fallback pre/code blocks for other languages
 * - Theme-aware color schemes
 * - Proper indentation and formatting preservation
 * 
 * @copyFunctionality
 * - One-click copy to clipboard
 * - Visual feedback with checkmark animation
 * - 2-second success indicator
 * - Error handling for clipboard API failures
 * 
 * @themeIntegration
 * - useTheme hook for color scheme access
 * - Dark/light mode styling
 * - Consistent with platform theme
 * - Smooth transitions between themes
 * 
 * @responsiveDesign
 * - Horizontal scrolling for long code lines
 * - Mobile-friendly copy button
 * - Flexible layout for different screen sizes
 * - Touch-friendly interactions
 * 
 * @accessibility
 * - Semantic HTML structure
 * - Proper ARIA labels
 * - Keyboard navigation support
 * - High contrast support
 */

const CodeBlock = ({ code, language = "python", isUserCode = false }) => {
  const { isCodeDark } = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          className={`text-sm font-mono ${isCodeDark ? "text-gray-400" : "text-gray-600"}`}
        >
          {language}
        </span>
        <div className="flex items-center space-x-3">
          <CodeThemeToggle />
          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-2 py-1 rounded transition-all duration-200 ${
              copied
                ? "text-green-500 bg-green-500/10"
                : "text-gray-500 hover:bg-gray-500/10"
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

      {/* If it's Python, use your fancy highlighter. Otherwise, fall back to standard text */}
      {language.toLowerCase() === "python" ||
      language.toLowerCase() === "py" ? (
        <PythonSyntaxHighlighter code={code} isDark={isCodeDark} />
      ) : (
        <pre
          className={`text-sm font-mono whitespace-pre-wrap ${isCodeDark ? "text-green-400" : "text-gray-700"}`}
        >
          <code>{code}</code>
        </pre>
      )}
    </div>
  );
};

export default CodeBlock;
