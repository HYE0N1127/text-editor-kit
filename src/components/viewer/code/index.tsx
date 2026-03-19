import Prism from "prismjs";
import { CodeBlock as CodeBlockType } from "../../../types/editor/index";

type Props = {
  block: CodeBlockType;
};

const CodeViewer = ({ block }: Props) => {
  const language = block.language || "javascript";
  const code = block.value || "";

  const grammar = Prism.languages[language] || Prism.languages.plaintext;
  const highlightedHtml = Prism.highlight(code, grammar, language);

  return (
    <div className="relative w-full h-full p-[16px]">
      <div className="absolute right-2 top-2 z-10 select-none text-xs text-gray-500">
        {language}
      </div>

      <pre
        className="m-0 p-0 text-[14px] leading-relaxed"
        style={{ fontFamily: '"Fira Code", "Fira Mono", monospace' }}
      >
        <code
          className={`language-${language}`}
          dangerouslySetInnerHTML={{ __html: highlightedHtml }}
        />
      </pre>
    </div>
  );
};

export default CodeViewer;
