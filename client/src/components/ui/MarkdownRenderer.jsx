// components/ui/MarkdownRenderer.jsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "../lesson";

const MarkdownRenderer = ({ content, moduleId = "M0", isDark = false }) => {
  const markdownComponents = {
    // Headings
    h1: ({ children }) => (
      <h1
        className={`text-2xl font-bold mb-4 mt-6 ${isDark ? "text-white" : "text-gray-800"}`}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className={`text-xl font-semibold mb-3 mt-6 ${isDark ? "text-gray-100" : "text-gray-800"}`}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className={`text-lg font-semibold mb-2 mt-4 ${isDark ? "text-gray-200" : "text-gray-800"}`}
      >
        {children}
      </h3>
    ),

    // Paragraphs
    p: ({ children, node }) => {
      if (
        node?.children?.length === 1 &&
        node.children[0].type === "element" &&
        node.children[0].tagName === "img"
      ) {
        return <>{children}</>;
      }

      return (
        <p
          className={`mb-4 leading-relaxed last:mb-0 ${isDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {children}
        </p>
      );
    },

    // Links - FIXED & IMPROVED
    a: ({ href, children }) => (
      <a
        href={href}
        className={`font-medium underline decoration-2 underline-offset-4 transition-colors ${
          isDark
            ? "text-blue-400 hover:text-blue-300 decoration-blue-800"
            : "text-blue-600 hover:text-blue-800 decoration-blue-200"
        }`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),

    // Lists
    // Lists
    ul: ({ children }) => (
      <ul
        className={`list-disc ml-6 mb-4 space-y-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={`list-decimal ml-6 mb-4 space-y-1 ${isDark ? "text-gray-300" : "text-gray-700"}`}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-2 mb-1">{children}</li>,

    // Inline Code and Code Blocks
    code: ({ children, className, inline, node }) => {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = inline || !className || !match;

      if (isInline) {
        return (
          <code
            className={`px-1.5 py-0.5 rounded border text-[0.9em] font-mono shadow-sm ${
              isDark
                ? "bg-gray-900 text-pink-400 border-gray-700"
                : "bg-gray-100 text-red-700 border-gray-300"
            }`}
          >
            {children}
          </code>
        );
      }

      const language = match[1];
      return (
        <CodeBlock
          code={String(children).replace(/\n$/, "")}
          language={language}
          isUserCode={false}
        />
      );
    },

    // Strong & Em
    strong: ({ children }) => (
      <strong
        className={`font-bold ${isDark ? "text-white" : "text-gray-900"}`}
      >
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em className={`italic ${isDark ? "text-gray-200" : "text-gray-800"}`}>
        {children}
      </em>
    ),

    // Images
    img: ({ src, alt }) => {
      let imageSrc = src;
      if (src && src.startsWith("./images/")) {
        const imageName = src.replace("./images/", "");
        imageSrc = `/api/content/modules/${moduleId}/images/${imageName}`;
      }

      return (
        <div className="my-8 text-center">
          <img
            src={imageSrc}
            alt={alt || "Lesson image"}
            className={`rounded-xl border shadow-lg max-w-full h-auto mx-auto ${
              isDark ? "border-gray-700" : "border-gray-300"
            }`}
            loading="lazy"
          />
          {alt && (
            <p
              className={`text-sm mt-2 italic ${isDark ? "text-gray-400" : "text-gray-600"}`}
            >
              {alt}
            </p>
          )}
        </div>
      );
    },

    // Horizontal rule
    hr: () => (
      <hr
        className={`my-8 border-t ${isDark ? "border-gray-700" : "border-gray-300"}`}
      />
    ),

    // Tables - RESTORED & THEMED
    table: ({ children }) => (
      <div className="overflow-x-auto my-8">
        <table
          className={`min-w-full divide-y border rounded-lg shadow-sm ${
            isDark
              ? "divide-gray-700 border-gray-700"
              : "divide-gray-200 border-gray-300"
          }`}
        >
          {children}
        </table>
      </div>
    ),
    th: ({ children }) => (
      <th
        className={`px-6 py-4 text-left text-sm font-semibold uppercase border-b ${
          isDark
            ? "text-gray-200 bg-gray-900/50 border-gray-700"
            : "text-gray-900 bg-gray-100 border-gray-300"
        }`}
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td
        className={`px-6 py-4 text-sm border-b ${
          isDark
            ? "text-gray-300 border-gray-700 bg-gray-800/30"
            : "text-gray-700 border-gray-300"
        }`}
      >
        {children}
      </td>
    ),

    // Add blockquote back too just in case!
    blockquote: ({ children }) => (
      <blockquote
        className={`border-l-4 pl-4 italic my-4 ${
          isDark
            ? "border-blue-800 text-gray-400"
            : "border-blue-500 text-gray-600"
        }`}
      >
        {children}
      </blockquote>
    ),
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
