// PythonSyntaxHighlighter.jsx

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
            <span className="text-gray-500 italic">{commentPart}</span>
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

    const keywords =
      /\b(if|else|elif|for|while|def|class|return|import|from|as|try|except|finally|with|lambda|yield|break|continue|pass|raise|assert|in|is|not|and|or|True|False|None)\b/g;

    const builtins =
      /\b(print|len|range|str|int|float|list|dict|set|tuple|input|open|type|isinstance|enumerate|zip|map|filter|sum|max|min|sorted|abs|round|any|all)\b/g;

    const strings = /(["'])(?:(?=(\\?))\2.)*?\1/g;

    const numbers = /\b\d+\.?\d*\b/g;

    let match;
    let lastIndex = 0;
    const allMatches = [];

    const patterns = [
      {
        regex: strings,
        className: isDark ? "text-yellow-300" : "text-yellow-600",
      },
      {
        regex: keywords,
        className: isDark ? "text-purple-400" : "text-purple-600",
      },
      {
        regex: builtins,
        className: isDark ? "text-blue-400" : "text-blue-600",
      },
      {
        regex: numbers,
        className: isDark ? "text-orange-400" : "text-orange-600",
      },
    ];

    patterns.forEach(({ regex, className }) => {
      const r = new RegExp(regex.source, regex.flags);
      while ((match = r.exec(remaining)) !== null) {
        allMatches.push({
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          className: className,
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
