//CodeBlock.jsx
import { useTheme } from "../../context";
import { CodeThemeToggle } from "../ui";

const CodeBlock = ({ code, language = "python", isUserCode = false }) => {
  const { isCodeDark } = useTheme();

  // Visual distinction between provided and user-generated code in dark/light mode
  const getTextColor = () => {
    if (isCodeDark) {
      return isUserCode ? "text-gray-200" : "text-green-400";
    } else {
      return isUserCode ? "text-gray-800" : "text-gray-700";
    }
  };

  return (
    <div
      className={`rounded-lg p-4 my-4 overflow-x-auto ${
        isCodeDark
          ? "bg-gray-900 border border-gray-700"
          : "bg-gray-100 border border-gray-300"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <span
          className={`text-sm font-mono ${
            isCodeDark ? "text-gray-400" : "text-gray-600 "
          }`}
        >
          {language}
        </span>
        <div className="flex items-center space-x-3">
          <CodeThemeToggle />
          <button
            onClick={() => navigator.clipboard.writeText(code)}
            className={`text-sm transition ${
              isCodeDark
                ? "text-gray-400 hover:text-white"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Copy
          </button>
        </div>
      </div>
      <pre
        className={`text-sm font-mono whitespace-pre-wrap ${getTextColor()}`}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
};

export default CodeBlock;
