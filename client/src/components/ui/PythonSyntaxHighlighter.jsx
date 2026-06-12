// PythonSyntaxHighlighter.jsx
/**
 * A custom Python syntax highlighter with comment handling and theme support.
 *
 * This component provides syntax highlighting for Python code without external
 * dependencies. It handles keywords, built-in functions, strings, numbers,
 * and comments with proper color coding for both light and dark themes.
 *
 * @component
 * @example
 * ```jsx
 * <PythonSyntaxHighlighter
 *   code="def hello():\n    print('Hello, World!')  # Greeting"
 *   isDark={true}
 * />
 * ```
 *
 * @param {Object} props - Component props
 * @param {string} props.code - Python code string to syntax highlight
 * @param {boolean} [props.isDark=true] - Theme mode for syntax colors
 *
 * @returns {JSX.Element} Syntax-highlighted code with line-by-line rendering
 *
 * @syntaxCategories
 * - Keywords: Control flow and structural Python keywords
 * - Built-ins: Common Python built-in functions
 * - Strings: Single and double quoted strings
 * - Numbers: Integer and floating-point literals
 * - Comments: Everything after # character (not inside strings)
 *
 * @colorScheme
 * Dark theme:
 * - Keywords: Purple (#text-purple-400)
 * - Built-ins: Blue (#text-blue-400)
 * - Strings: Yellow (#text-yellow-300)
 * - Numbers: Orange (#text-orange-400)
 * - Code: Green (#text-green-400)
 * - Comments: Gray (#text-gray-400)
 *
 * Light theme:
 * - Keywords: Purple (#text-purple-600)
 * - Built-ins: Blue (#text-blue-600)
 * - Strings: Yellow (#text-yellow-600)
 * - Numbers: Orange (#text-orange-600)
 * - Code: Green (#text-green-600)
 * - Comments: Gray (#text-gray-400)
 *
 * @highlightingLogic
 * The highlighter uses a multi-pass approach:
 * 1. Split code into lines for comment handling
 * 2. For each line, separate code and comment parts
 * 3. Apply syntax highlighting to code part only
 * 4. Render comment part with italic gray styling
 *
 * Token matching process:
 * - Find all matches for each pattern type
 * - Sort matches by start position
 * - Render tokens in correct order
 * - Handle overlapping and adjacent tokens
 *
 * @regexPatterns
 * - Keywords: Word boundaries around Python keywords
 * - Built-ins: Word boundaries around common functions
 * - Strings: Handles escaped quotes and nested quotes
 * - Numbers: Integer and decimal number patterns
 * - Comments: Simple # character detection (post-processing)
 *
 * @performanceNotes
 * - Custom regex patterns for each token type
 * - Efficient string processing with substring operations
 * - React keys for stable rendering
 * - No external dependencies required
 *
 * @limitations
 * - Basic comment detection (doesn't handle # inside strings)
 * - Limited to common Python keywords and built-ins
 * - No support for multi-line strings or docstrings
 * - Simple regex-based approach (no full parsing)
 */

const KEYWORDS_REGEX =
  /\b(if|else|elif|for|while|def|class|return|import|from|as|try|except|finally|with|lambda|yield|break|continue|pass|raise|assert|in|is|not|and|or|True|False|None)\b/g;
const BUILTINS_REGEX =
  /\b(print|len|range|str|int|float|list|dict|set|tuple|input|open|type|isinstance|enumerate|zip|map|filter|sum|max|min|sorted|abs|round|any|all)\b/g;
const STRINGS_REGEX = /(["'])(?:(?=(\\?))\2.)*?\1/g;
const NUMBERS_REGEX = /\b\d+\.?\d*\b/g;

const getPatterns = (isDark) => [
  {
    regex: STRINGS_REGEX,
    className: isDark ? "text-yellow-300" : "text-yellow-600",
  },
  {
    regex: KEYWORDS_REGEX,
    className: isDark ? "text-purple-400" : "text-purple-600",
  },
  {
    regex: BUILTINS_REGEX,
    className: isDark ? "text-blue-400" : "text-blue-600",
  },
  {
    regex: NUMBERS_REGEX,
    className: isDark ? "text-orange-400" : "text-orange-600",
  },
];

const PythonSyntaxHighlighter = ({ code, isDark = true }) => {
  const higlightPython = (code) => {
    const lines = code.split("\n");

    return lines.map((line, lineIndex) => {
      // Look for '#' that IS NOT inside a string
      // A simpler way for a custom highlighter:
      const commentIndex = line.indexOf("#");

      if (commentIndex !== -1) {
        const codePart = line.substring(0, commentIndex);
        const commentPart = line.substring(commentIndex);
        return (
          <div key={lineIndex}>
            {highlightCode(codePart, isDark)}
            <span className="text-gray-400 italic">{commentPart}</span>
          </div>
        );
      }

      return (
        <div key={lineIndex} className="leading-relaxed py-0.5">
          {highlightCode(line, isDark)}
        </div>
      );
    });
  };

  const highlightCode = (code) => {
    const tokens = [];
    let remaining = code;
    let key = 0;

    const baseCodeClass = isDark ? "text-green-400" : "text-gray-700";

    const patterns = getPatterns(isDark).map((p) => ({
      ...p,
      regex: new RegExp(p.regex.source, p.regex.flags),
    }));

    const allMatches = [];
    patterns.forEach(({ regex, className }) => {
      let match;
      while ((match = regex.exec(remaining)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          className,
        });
      }
    });

    allMatches.sort((a, b) => a.start - b.start);

    let currentPos = 0;
    allMatches.forEach((match) => {
      if (match.start >= currentPos) {
        // Add text before this match
        if (match.start > currentPos) {
          tokens.push(
            <span
              key={key++}
              className={isDark ? "text-green-400" : "text-green-600"}
            >
              {remaining.substring(currentPos, match.start)}
            </span>,
          );
        }
        // Add the matched token with highlighting
        tokens.push(
          <span key={key++} className={match.className}>
            {match.text}
          </span>,
        );
        currentPos = match.end;
      }
    });

    if (currentPos < remaining.length) {
      tokens.push(
        <span key={key++} className={baseCodeClass}>
          {remaining.substring(currentPos)}
        </span>,
      );
    }

    return tokens.length > 0 ? (
      tokens
    ) : (
      <span className={baseCodeClass}>{code}</span>
    );
  };

  return (
    <div className="font-mono whitespace-pre text-left">
      {higlightPython(code)}
    </div>
  );
};

export default PythonSyntaxHighlighter;
