import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "../lesson";
import { useTheme } from "../../context";

const MarkdownRenderer = ({ content, moduleId = "M0" }) => {
  const { isDarkMode } = useTheme();

  // Custom component for containers
  const CustomContainer = ({ type, children }) => {
    const containerStyles = {
      summary: {
        light: {
          bg: "bg-blue-50",
          border: "border-l-4 border-blue-500",
          text: "text-blue-800",
          title: "text-blue-900",
          emoji: "📝",
        },
        dark: {
          bg: "bg-blue-900/20",
          border: "border-l-4 border-blue-400",
          text: "text-blue-200",
          title: "text-blue-200",
          emoji: "📝",
        },
        title: "What You've Learned",
      },
      tip: {
        light: {
          bg: "bg-yellow-50",
          border: "border-l-4 border-yellow-500",
          text: "text-yellow-800",
          title: "text-yellow-900",
          emoji: "💡",
        },
        dark: {
          bg: "bg-yellow-900/20",
          border: "border-l-4 border-yellow-400",
          text: "text-yellow-200",
          title: "text-yellow-200",
          emoji: "💡",
        },
        title: "Pro Tip",
      },
      warning: {
        light: {
          bg: "bg-red-50",
          border: "border-l-4 border-red-500",
          text: "text-red-800",
          title: "text-red-900",
          emoji: "⚠️",
        },
        dark: {
          bg: "bg-red-900/20",
          border: "border-l-4 border-red-400",
          text: "text-red-200",
          title: "text-red-200",
          emoji: "⚠️",
        },
        title: "Important",
      },
      note: {
        light: {
          bg: "bg-emerald-50",
          border: "border-l-4 border-emerald-500",
          text: "text-emerald-800",
          title: "text-emerald-900",
          emoji: "📌",
        },
        dark: {
          bg: "bg-emerald-900/20",
          border: "border-l-4 border-emerald-400",
          text: "text-emerald-200",
          title: "text-emerald-200",
          emoji: "📌",
        },
        title: "Note",
      },
    };

    const style = containerStyles[type] || containerStyles.summary;
    const colors = isDarkMode ? style.dark : style.light;

    return (
      <div className={`my-6 p-4 rounded-r-lg ${colors.bg} ${colors.border}`}>
        <div className="flex items-start">
          <span className="mr-2 text-xl">{colors.emoji}</span>
          <div className="flex-1">
            <strong
              className={`block mb-3 text-lg font-semibold ${colors.title}`}
            >
              {style.title}
            </strong>
            <ContainerContent type={type}>{children}</ContainerContent>
          </div>
        </div>
      </div>
    );
  };

  // New component to render content with dynamic colors
  const ContainerContent = ({ type, children }) => {
    // Define text colors for each container type
    const textColors = {
      summary: {
        light: "text-blue-800",
        dark: "text-blue-200",
      },
      tip: {
        light: "text-yellow-800",
        dark: "text-yellow-200",
      },
      warning: {
        light: "text-red-800",
        dark: "text-red-200",
      },
      note: {
        light: "text-emerald-800",
        dark: "text-emerald-200",
      },
    };

    const color = textColors[type] || textColors.summary;
    const textColor = isDarkMode ? color.dark : color.light;

    // Create dynamic components based on container type
    const dynamicComponents = {
      h1: ({ children }) => (
        <h2 className={`text-xl font-semibold mb-3 mt-2 ${textColor}`}>
          {children}
        </h2>
      ),
      h2: ({ children }) => (
        <h3 className={`text-lg font-semibold mb-2 mt-2 ${textColor}`}>
          {children}
        </h3>
      ),
      h3: ({ children }) => (
        <h4 className={`font-semibold mb-1 mt-2 ${textColor}`}>{children}</h4>
      ),
      p: ({ children }) => (
        <p className={`mb-2 leading-relaxed ${textColor}`}>{children}</p>
      ),
      ul: ({ children }) => (
        <ul className={`list-disc ml-6 mb-3 space-y-1 ${textColor}`}>
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol className={`list-decimal ml-6 mb-3 space-y-1 ${textColor}`}>
          {children}
        </ol>
      ),
      li: ({ children }) => <li className="pl-2 mb-1">{children}</li>,
      code: ({ children, className, inline }) => {
        const match = /language-(\w+)/.exec(className || "");
        const isInline = inline || !className || !match;

        if (isInline) {
          return (
            <code className="px-1.5 py-0.5 rounded border text-[0.9em] font-mono bg-gray-200 dark:bg-gray-900 text-red-700 dark:text-green-500 border-gray-300 dark:border-gray-600 shadow-sm">
              {children}
            </code>
          );
        }
        return (
          <CodeBlock
            code={String(children).replace(/\n$/, "")}
            language={match[1]}
          />
        );
      },
      strong: ({ children }) => (
        <strong className={`font-bold ${textColor}`}>{children}</strong>
      ),
      em: ({ children }) => (
        <em className={`italic ${textColor}`}>{children}</em>
      ),
      a: ({ href, children }) => (
        <a
          href={href}
          className={`font-medium underline ${isDarkMode ? "text-blue-300 hover:text-blue-200" : "text-blue-700 hover:text-blue-900"}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          {children}
        </a>
      ),
    };

    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={dynamicComponents}>
        {children}
      </ReactMarkdown>
    );
  };

  // Parse content and extract containers
  const parseContent = (text) => {
    if (!text) return [];

    const lines = text.split("\n");
    const result = [];
    let i = 0;

    while (i < lines.length) {
      // Check if line starts a container
      if (lines[i].trim().startsWith(":::")) {
        const type = lines[i].trim().replace(":::", "").trim();
        const containerLines = [];
        i++;

        // Collect container content
        while (i < lines.length && lines[i].trim() !== ":::") {
          containerLines.push(lines[i]);
          i++;
        }
        i++; // Skip closing :::

        const content = containerLines.join("\n");

        result.push({
          type: "container",
          containerType: type,
          content: content,
        });
      } else {
        // Regular content
        const regularLines = [];
        while (i < lines.length && !lines[i].trim().startsWith(":::")) {
          regularLines.push(lines[i]);
          i++;
        }
        result.push({
          type: "markdown",
          content: regularLines.join("\n"),
        });
      }
    }

    return result;
  };

  const parsedContent = parseContent(content);

  // Regular markdown components with dark mode support
  const markdownComponents = {
    h1: ({ children }) => (
      <h1
        className={`text-2xl font-bold mb-4 mt-6 ${isDarkMode ? "text-white" : "text-gray-800"}`}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className={`text-xl font-semibold mb-3 mt-6 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className={`text-lg font-semibold mb-2 mt-4 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
      >
        {children}
      </h3>
    ),
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
          className={`mb-4 leading-relaxed last:mb-0 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
        >
          {children}
        </p>
      );
    },
    a: ({ href, children }) => (
      <a
        href={href}
        className={`font-medium underline decoration-2 underline-offset-4 transition-colors ${
          isDarkMode
            ? "text-blue-400 hover:text-blue-300 decoration-blue-800 "
            : "text-blue-600 hover:text-blue-800 decoration-blue-200"
        }`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    ul: ({ children }) => (
      <ul
        className={`list-disc ml-6 mb-4 space-y-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol
        className={`list-decimal ml-6 mb-4 space-y-1 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        {children}
      </ol>
    ),
    li: ({ children }) => <li className="pl-2 mb-1">{children}</li>,
    code: ({ children, className, inline }) => {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = inline || !className || !match;

      if (isInline) {
        return (
          <code className="px-1.5 py-0.5 rounded border text-[0.9em] font-mono bg-gray-200  text-red-700 dark:bg-gray-900 dark:text-green-500 border-gray-300 dark:border-gray-600 shadow-sm">
            {children}
          </code>
        );
      }
      return (
        <CodeBlock
          code={String(children).replace(/\n$/, "")}
          language={match[1]}
        />
      );
    },
    strong: ({ children }) => (
      <strong
        className={`font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
      >
        {children}
      </strong>
    ),
    em: ({ children }) => (
      <em
        className={`italic ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
      >
        {children}
      </em>
    ),
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
              isDarkMode ? "border-gray-700" : "border-gray-300"
            }`}
            loading="lazy"
          />
          {alt && (
            <p
              className={`text-sm mt-2 italic ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}
            >
              {alt}
            </p>
          )}
        </div>
      );
    },
    hr: () => (
      <hr
        className={`my-8 border-t ${isDarkMode ? "border-gray-700" : "border-gray-300"}`}
      />
    ),
    table: ({ children }) => (
      <div className="overflow-x-auto my-8">
        <table
          className={`min-w-full divide-y border rounded-lg shadow-sm ${
            isDarkMode
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
          isDarkMode
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
          isDarkMode
            ? "text-gray-300 border-gray-700 bg-gray-800/30"
            : "text-gray-700 border-gray-300"
        }`}
      >
        {children}
      </td>
    ),
    blockquote: ({ children }) => (
      <blockquote
        className={`border-l-4 pl-4 italic my-4 ${
          isDarkMode
            ? "border-blue-800 text-gray-400"
            : "border-blue-500 text-gray-600"
        }`}
      >
        {children}
      </blockquote>
    ),
  };

  return (
    <div>
      {parsedContent.map((section, index) => {
        if (section.type === "container") {
          return (
            <CustomContainer key={index} type={section.containerType}>
              {section.content}
            </CustomContainer>
          );
        } else {
          return (
            <ReactMarkdown
              key={index}
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {section.content}
            </ReactMarkdown>
          );
        }
      })}
    </div>
  );
};

export default MarkdownRenderer;
