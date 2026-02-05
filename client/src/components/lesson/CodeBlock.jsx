import { useState } from "react";
import { useTheme } from "../../context";
import { CodeThemeToggle, PythonSyntaxHighlighter } from "../ui";
import { Check, Copy } from "lucide-react";

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
