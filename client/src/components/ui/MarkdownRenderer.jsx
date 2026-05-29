import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CodeBlock } from "../lesson";
import { useTheme } from "../../context";
import ImageViewer from "./ImageViewer";

/**
 * A sophisticated Markdown renderer with custom container parsing and theme support.
 *
 * This component extends standard Markdown rendering with:
 * - Custom container syntax (e.g., :::tip, :::warning, :::note, :::summary)
 * - Automatic image path resolution for module-specific images
 * - Theme-aware styling for both light and dark modes
 * - Comprehensive component overrides for consistent styling
 *
 * @component
 * @example
 * ```jsx
 * <MarkdownRenderer
 *   content="# Hello\n\n:::tip\nThis is a tip!\n:::\n\n![image](./images/example.png)"
 *   moduleId="M1"
 *   isDark={false}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {string} props.content - The markdown content to render. Supports standard markdown plus custom container syntax.
 * @param {string} [props.moduleId="M0"] - Module identifier used for resolving relative image paths. Images starting with "./images/" will be prefixed with `/api/content/modules/${moduleId}/images/`
 * @param {boolean} [props.isDark] - Explicit theme override. If provided, takes precedence over global theme. If undefined, uses global theme context.
 *
 * @returns {JSX.Element} Rendered markdown content with custom styling and containers
 *
 * @customContainerSyntax
 * Custom containers use the syntax:
 * ```
 * :::container-type
 * Content here (supports full markdown)
 * :::
 * ```
 *
 * Supported container types:
 * - `summary` - Blue styled container with "What You've Learned" title
 * - `tip` - Yellow styled container with "Pro Tip" title
 * - `warning` - Red styled container with "Important" title
 * - `note` - Green styled container with "Note" title
 *
 * @internalLogic
 * The component uses a two-phase parsing approach:
 * 1. `parseContent()` - Splits content into regular markdown and custom container blocks
 * 2. Renders each section with appropriate components
 *
 * Image path resolution:
 * - Relative paths starting with "./images/" are converted to absolute API paths
 * - Other paths are passed through unchanged
 * - Images are wrapped in responsive containers with alt text captions
 *
 * Theme handling:
 * - Uses `useTheme()` hook for global theme state
 * - Merges explicit `isDark` prop with global theme
 * - Applies theme-specific Tailwind classes throughout
 */

/**
 * Generates a URL-safe id from a heading string, matching the format used in
 * anchor links (e.g. "Contact details" → "contact-details").
 */
const slugify = (text) => {
  if (typeof text !== "string") return undefined;
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
};

const MarkdownRenderer = ({ content, moduleId = "M0", isDark }) => {
  const { isDarkMode: globalIsDarkMode } = useTheme();

  // Determine active theme: Use explicit prop if provided, otherwise fallback to global site theme
  const activeDark = isDark !== undefined ? isDark : globalIsDarkMode;

  // Lightbox for images
  const [lightboxImage, setLightboxImage] = useState(null);

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
    const colors = activeDark ? style.dark : style.light;

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

  const ContainerContent = ({ type, children }) => {
    const textColors = {
      summary: { light: "text-blue-800", dark: "text-blue-200" },
      tip: { light: "text-yellow-800", dark: "text-yellow-200" },
      warning: { light: "text-red-800", dark: "text-red-200" },
      note: { light: "text-emerald-800", dark: "text-emerald-200" },
    };

    const color = textColors[type] || textColors.summary;
    const textColor = activeDark ? color.dark : color.light;

    const dynamicComponents = {
      h1: ({ children }) => (
        <h2
          id={slugify(children)}
          className={`text-xl font-semibold mb-3 mt-2 ${textColor}`}
        >
          {children}
        </h2>
      ),
      h2: ({ children }) => (
        <h3
          id={slugify(children)}
          className={`text-lg font-semibold mb-2 mt-2 ${textColor}`}
        >
          {children}
        </h3>
      ),
      h3: ({ children }) => (
        <h4
          id={slugify(children)}
          className={`font-semibold mb-1 mt-2 ${textColor}`}
        >
          {children}
        </h4>
      ),
      p: ({ children }) => (
        <p className={`mb-2 leading-relaxed ${textColor}`}>{children}</p>
      ),
      img: ({ src, alt }) => {
        console.log("img inside container:", src);
        return <img src={src} alt={alt} />;
      },
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
            <code className="px-1.5 py-0.5 rounded border text-[0.9em] font-mono bg-gray-200  text-red-700 dark:bg-gray-300 border-gray-300  shadow-sm">
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
    };

    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={dynamicComponents}>
        {children}
      </ReactMarkdown>
    );
  };

  const parseContent = (text) => {
    if (!text) return [];
    const lines = text.split("\n");
    const result = [];
    let i = 0;

    while (i < lines.length) {
      if (lines[i].trim().startsWith(":::")) {
        const type = lines[i].trim().replace(":::", "").trim();
        const containerLines = [];
        i++;
        while (i < lines.length && lines[i].trim() !== ":::") {
          containerLines.push(lines[i]);
          i++;
        }
        i++;
        const content = containerLines.join("\n");
        result.push({
          type: "container",
          containerType: type,
          content: content,
        });
      } else {
        const regularLines = [];
        while (i < lines.length && !lines[i].trim().startsWith(":::")) {
          regularLines.push(lines[i]);
          i++;
        }
        result.push({ type: "markdown", content: regularLines.join("\n") });
      }
    }
    return result;
  };

  const parsedContent = parseContent(content);

  const markdownComponents = {
    h1: ({ children }) => (
      <h1
        id={slugify(children)}
        className={`text-2xl font-bold mb-4 mt-6 ${activeDark ? "text-white" : "text-gray-800"}`}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        id={slugify(children)}
        className={`text-xl font-semibold mb-3 mt-6 ${activeDark ? "text-gray-100" : "text-gray-800"}`}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        id={slugify(children)}
        className={`text-lg font-semibold mb-2 mt-4 ${activeDark ? "text-gray-200" : "text-gray-800"}`}
      >
        {children}
      </h3>
    ),

    p: ({ children, node }) => {
      // Check if paragraph contains only an image
      if (
        node?.children?.length === 1 &&
        node.children[0].type === "element" &&
        node.children[0].tagName === "img"
      ) {
        // Don't wrap standalone images in <p> tags
        return <>{children}</>;
      }

      // Check if paragraph contains any block-level elements
      const hasBlockElement = node?.children?.some((child) => {
        if (child.type !== "element") return false;
        const blockTags = [
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
        ];
        return blockTags.includes(child.tagName);
      });

      // Use div for paragraphs containing block elements
      if (hasBlockElement) {
        return (
          <div
            className={`mb-4 leading-relaxed last:mb-0 ${activeDark ? "text-gray-300" : "text-gray-700"}`}
          >
            {children}
          </div>
        );
      }

      return (
        <p
          className={`mb-4 leading-relaxed last:mb-0 ${activeDark ? "text-gray-300" : "text-gray-700"}`}
        >
          {children}
        </p>
      );
    },

    a: ({ href, children }) => {
      const isAnchor = href?.startsWith("#");
      const isInternal = href?.startsWith("/") && !isAnchor;

      if (isInternal) {
        return (
          <Link
            to={href}
            className={`font-medium underline decoration-2 underline-offset-4 transition-colors ${
              activeDark
                ? "text-blue-400 hover:text-blue-300 decoration-blue-800"
                : "text-blue-600 hover:text-blue-800 decoration-blue-200"
            }`}
          >
            {children}
          </Link>
        );
      }

      // External links or anchor links
      return (
        <a
          href={href}
          className={`font-medium underline decoration-2 underline-offset-4 transition-colors ${
            activeDark
              ? "text-blue-400 hover:text-blue-300 decoration-blue-800"
              : "text-blue-600 hover:text-blue-800 decoration-blue-200"
          }`}
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

      if (src && src.startsWith("./images/")) {
        const imageName = src.replace("./images/", "");
        imageSrc = `${API_BASE}/curriculum/Module${moduleId}/images/${imageName}`;
      } else if (src && src.startsWith("/curriculum/")) {
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
              if (e.key === "Enter" || e.key === " ") {
                setLightboxImage({ src: imageSrc, alt });
              }
            }}
            aria-label={`View larger image: ${alt || "Lesson image"}`}
          >
            {/* Hover overlay */}
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 
                        transition-opacity bg-black/20 rounded-xl
                        flex items-center justify-center pointer-events-none"
            >
              <div
                className="bg-black/60 text-white px-3 py-1.5 rounded-full 
                          text-sm flex items-center gap-1.5"
              >
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
              className={`
            rounded-xl border shadow-lg
            w-full max-w-full h-auto
            min-h-[80px] md:min-h-[100px]
            ${activeDark ? "border-gray-700" : "border-gray-300"}
            transition-transform duration-200
            group-hover:scale-[1.01]
          `}
              loading="lazy"
            />
          </div>

          {alt && (
            <figcaption
              className={`
            text-xs md:text-sm mt-2 italic px-2
            ${activeDark ? "text-gray-400" : "text-gray-600"}
          `}
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
