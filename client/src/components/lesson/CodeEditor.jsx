import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";
import { lintGutter } from "@codemirror/lint";
import { useTheme } from "../../context";

const CodeEditor = ({
  value,
  onChange,
  readOnly = false,
  height = "200px",
  className = "",
}) => {
  const { isCodeDark } = useTheme();

  return (
    <div
      className={`rounded-lg overflow-hidden border ${
        isCodeDark ? "border-gray-600" : "border-gray-300"
      } ${className}`}
    >
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={[python(), lintGutter()]}
        theme={isCodeDark ? "dark" : "light"}
        height={height}
        editable={!readOnly}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLine: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
        }}
      />
    </div>
  );
};

export default CodeEditor;
