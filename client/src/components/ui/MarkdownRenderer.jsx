import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { CodeBlock } from "../lesson";
import { useTheme } from "../../context";
import ImageViewer from "./ImageViewer";
import { slugifyHeading, parseContent } from "../../utils";

// ── Static configuration ────────────────────────────────────────

const CONTAINER_STYLES = {
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

const CONTAINER_TEXT_COLORS = {
  summary: { light: "text-blue-800", dark: "text-blue-200" },
  tip: { light: "text-yellow-800", dark: "text-yellow-200" },
  warning: { light: "text-red-800", dark: "text-red-200" },
  note: { light: "text-emerald-800", dark: "text-emerald-200" },
};

// ── Component ────────────────────────────────────────────────────

const MarkdownRenderer = ({ content, moduleId = "M0", isDark }) => {
  const { isDarkMode: globalIsDarkMode } = useTheme();
  const activeDark = isDark !== undefined ? isDark : globalIsDarkMode;
  const [lightboxImage, setLightboxImage] = useState(null);

  // Memoize parsed content — only re-parse when content changes
  const parsedContent = useMemo(() => parseContent(content), [content]);

  const getContainerTextColor = (containerType, isDark) => {
    const colors =
      CONTAINER_TEXT_COLORS[containerType] || CONTAINER_TEXT_COLORS.summary;
    return isDark ? colors.dark : colors.light;
  };

  // ── Container sub-components ──────────────────────────────────

  const dynamicComponents = useMemo(() => {
    return (containerType) => ({
      h1: ({ children }) => (
        <h2
          id={slugifyHeading(children)}
          className={`text-xl font-semibold mb-3 mt-2 ${getContainerTextColor(containerType, activeDark)}`}
        >
          {children}
        </h2>
      ),
      h2: ({ children }) => (
        <h3
          id={slugifyHeading(children)}
          className={`text-lg font-semibold mb-2 mt-2 ${getContainerTextColor(containerType, activeDark)}`}
        >
          {children}
        </h3>
      ),
      h3: ({ children }) => (
        <h4
          id={slugifyHeading(children)}
          className={`font-semibold mb-1 mt-2 ${getContainerTextColor(containerType, activeDark)}`}
        >
          {children}
        </h4>
      ),
      p: ({ children }) => (
        <p
          className={`mb-2 leading-relaxed ${getContainerTextColor(containerType, activeDark)}`}
        >
          {children}
        </p>
      ),
      img: ({ src, alt }) => <img src={src} alt={alt} />,
      ul: ({ children }) => (
        <ul
          className={`list-disc ml-6 mb-3 space-y-1 ${getContainerTextColor(containerType, activeDark)}`}
        >
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol
          className={`list-decimal ml-6 mb-3 space-y-1 ${getContainerTextColor(containerType, activeDark)}`}
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
            <code className="px-1.5 py-0.5 rounded border text-[0.9em] font-mono bg-gray-200 text-red-700 dark:bg-gray-300 border-gray-300 shadow-sm">
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
          className={`font-bold ${getContainerTextColor(containerType, activeDark)}`}
        >
          {children}
        </strong>
      ),
      em: ({ children }) => (
        <em
          className={`italic ${getContainerTextColor(containerType, activeDark)}`}
        >
          {children}
        </em>
      ),
      a: ({ href, children }) => {
        const isAnchor = href?.startsWith("#");
        const isInternal = href?.startsWith("/") && !isAnchor;
        if (isInternal) {
          return (
            <Link
              to={href}
              className={`font-medium underline ${activeDark ? "text-blue-300 hover:text-blue-200" : "text-blue-700 hover:text-blue-900"}`}
            >
              {children}
            </Link>
          );
        }
        return (
          <a
            href={href}
            className={`font-medium underline ${activeDark ? "text-blue-300 hover:text-blue-200" : "text-blue-700 hover:text-blue-900"}`}
            {...(!isAnchor && { target: "_blank", rel: "noopener noreferrer" })}
          >
            {children}
          </a>
        );
      },
    });
  }, [activeDark]);

  const CustomContainer = useMemo(() => {
    return ({ type, children }) => {
      const style = CONTAINER_STYLES[type] || CONTAINER_STYLES.summary;
      const colors = activeDark ? style.dark : style.light;
      const containerComponents = dynamicComponents(type);

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
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={containerComponents}
              >
                {children}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      );
    };
  }, [activeDark, dynamicComponents]);

  // ── Main markdown components ──────────────────────────────────

  const markdownComponents = useMemo(
    () => ({
      h1: ({ children }) => (
        <h1
          id={slugifyHeading(children)}
          className={`text-2xl font-bold mb-4 mt-6 ${activeDark ? "text-white" : "text-gray-800"}`}
        >
          {children}
        </h1>
      ),
      h2: ({ children }) => (
        <h2
          id={slugifyHeading(children)}
          className={`text-xl font-semibold mb-3 mt-6 ${activeDark ? "text-gray-100" : "text-gray-800"}`}
        >
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3
          id={slugifyHeading(children)}
          className={`text-lg font-semibold mb-2 mt-4 ${activeDark ? "text-gray-200" : "text-gray-800"}`}
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
        const hasBlockElement = node?.children?.some((child) => {
          if (child.type !== "element") return false;
          return [
            "div",
            "p",
            "table",
            "ul",
            "ol",
            "blockquote",
            "pre",
            "hr",
            "img",
            "figure",
          ].includes(child.tagName);
        });
        const Tag = hasBlockElement ? "div" : "p";
        return (
          <Tag
            className={`mb-4 leading-relaxed last:mb-0 ${activeDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {children}
          </Tag>
        );
      },
      a: ({ href, children }) => {
        const isAnchor = href?.startsWith("#");
        const isInternal = href?.startsWith("/") && !isAnchor;
        const linkClass = `font-medium underline decoration-2 underline-offset-4 transition-colors ${activeDark ? "text-blue-400 hover:text-blue-300 decoration-blue-800" : "text-blue-600 hover:text-blue-800 decoration-blue-200"}`;
        if (isInternal)
          return (
            <Link to={href} className={linkClass}>
              {children}
            </Link>
          );
        return (
          <a
            href={href}
            className={linkClass}
            {...(!isAnchor && { target: "_blank", rel: "noopener noreferrer" })}
          >
            {children}
          </a>
        );
      },
      ul: ({ children }) => (
        <ul
          className={`list-disc ml-6 mb-4 space-y-1 ${activeDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {children}
        </ul>
      ),
      ol: ({ children }) => (
        <ol
          className={`list-decimal ml-6 mb-4 space-y-1 ${activeDark ? "text-gray-300" : "text-gray-700"}`}
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
            <code className="px-1.5 py-0.5 rounded border text-[0.9em] font-mono bg-gray-200 text-red-700 dark:bg-gray-300 border-gray-300 shadow-sm">
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
          className={`font-bold ${activeDark ? "text-white" : "text-gray-900"}`}
        >
          {children}
        </strong>
      ),
      em: ({ children }) => (
        <em
          className={`italic ${activeDark ? "text-gray-200" : "text-gray-800"}`}
        >
          {children}
        </em>
      ),
      img: ({ src, alt, title }) => {
        let imageSrc = src;
        const API_BASE = import.meta.env.VITE_BACKEND_URL;

        if (src?.startsWith("./images/")) {
          imageSrc = `${API_BASE}/curriculum/Module${moduleId}/images/${src.replace("./images/", "")}`;
        } else if (src?.startsWith("/curriculum/")) {
          imageSrc = `${API_BASE}${src}`;
        }

        return (
          <figure className="my-4 md:my-8 text-center">
            <div
              className="relative inline-block max-w-full group cursor-pointer"
              onClick={() => setLightboxImage({ src: imageSrc, alt })}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ")
                  setLightboxImage({ src: imageSrc, alt });
              }}
              aria-label={`View larger image: ${alt || "Lesson image"}`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 rounded-xl flex items-center justify-center pointer-events-none">
                <div className="bg-black/60 text-white px-3 py-1.5 rounded-full text-sm flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                  View
                </div>
              </div>
              <img
                src={imageSrc}
                alt={alt || "Lesson image"}
                title={title}
                className={`rounded-xl border shadow-lg w-full max-w-full h-auto min-h-[80px] md:min-h-[100px] ${activeDark ? "border-gray-700" : "border-gray-300"} transition-transform duration-200 group-hover:scale-[1.01]`}
                loading="lazy"
              />
            </div>
            {alt && (
              <figcaption
                className={`text-xs md:text-sm mt-2 italic px-2 ${activeDark ? "text-gray-400" : "text-gray-600"}`}
              >
                {alt}
                <span className="hidden md:inline"> — Click to view</span>
                <span className="md:hidden">
                  {" "}
                  — Tap to view & rotate if needed
                </span>
              </figcaption>
            )}
          </figure>
        );
      },
      hr: () => (
        <hr
          className={`my-8 border-t ${activeDark ? "border-gray-700" : "border-gray-300"}`}
        />
      ),
      table: ({ children }) => (
        <div className="overflow-x-auto my-8">
          <table
            className={`min-w-full divide-y border rounded-lg shadow-sm ${activeDark ? "divide-gray-700 border-gray-700" : "divide-gray-200 border-gray-300"}`}
          >
            {children}
          </table>
        </div>
      ),
      th: ({ children }) => (
        <th
          className={`px-6 py-4 text-left text-sm font-semibold uppercase border-b ${activeDark ? "text-gray-200 bg-gray-900/50 border-gray-700" : "text-gray-900 bg-gray-100 border-gray-300"}`}
        >
          {children}
        </th>
      ),
      td: ({ children }) => (
        <td
          className={`px-6 py-4 text-sm border-b ${activeDark ? "text-gray-300 border-gray-700 bg-gray-800/30" : "text-gray-700 border-gray-300"}`}
        >
          {children}
        </td>
      ),
      blockquote: ({ children }) => (
        <blockquote
          className={`border-l-4 pl-4 italic my-4 ${activeDark ? "border-blue-800 text-gray-400" : "border-blue-500 text-gray-600"}`}
        >
          {children}
        </blockquote>
      ),
    }),
    [activeDark, moduleId],
  );

  // ── Render ────────────────────────────────────────────────────

  return (
    <div>
      {parsedContent.map((section, index) => {
        if (section.type === "container") {
          return (
            <CustomContainer key={index} type={section.containerType}>
              {section.content}
            </CustomContainer>
          );
        }
        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm]}
            components={markdownComponents}
          >
            {section.content}
          </ReactMarkdown>
        );
      })}

      {lightboxImage && (
        <ImageViewer
          src={lightboxImage.src}
          alt={lightboxImage.alt}
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
        />
      )}
    </div>
  );
};

export default MarkdownRenderer;
