// src/components/ui/MarkdownRenderer.jsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "../lesson";

const markdownComponents = {
  // Headings
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-gray-800 mb-4 mt-6">{children}</h1>
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

  // Text
  p: ({ children }) => (
    <p className="text-gray-700 mb-4 leading-relaxed last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-gray-800">{children}</strong>
  ),
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 my-4">
      {children}
    </blockquote>
  ),

  // Lists
  ul: ({ children }) => (
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1">
      {children}
    </ul>
  ),
  li: ({ children }) => <li className="pl-2">{children}</li>,

  // Tables (Keep your great table styling!)
  table: ({ children }) => (
    <div className="overflow-x-auto my-8">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg shadow-sm">
        {children}
      </table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 uppercase bg-gray-100 border-b border-gray-300">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-6 py-4 text-sm text-gray-700 border-b border-gray-300">
      {children}
    </td>
  ),

  // The Magic Code Logic
  code: ({ children, className }) => {
    const isInline = !className;
    if (isInline) {
      return (
        <code className="bg-gray-300 text-red-700 px-1.5 py-0.5 rounded border border-gray-400 text-[0.9em] font-mono shadow-sm">
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
};

const MarkdownRenderer = ({ content }) => {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
      {content}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;
