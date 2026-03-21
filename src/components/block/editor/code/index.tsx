import Editor from "react-simple-code-editor";
import { useEffect, useRef } from "react";
import { CodeBlock as CodeBlockType } from "../../../../types/editor/index";
import { useEditor } from "../../../context/editor/hooks";
import { useFocusHandler, useFocusState } from "../../../context/focus/hooks";
import { generateId } from "../../../../utils/id";
import Prism from "prismjs";

type Props = {
  id: string;
  block: CodeBlockType;
};

/**
 * 코드 블록의 편집을 담당하는 컴포넌트입니다.
 * Prism.js를 사용하여 문법 하이라이팅을 제공하며, react-simple-code-editor를 기반으로 동작합니다.
 *
 * @param id 해당 코드 블록의 고유 식별자
 * @param block 코드 내용과 선택된 언어(language) 정보를 포함하는 블록 데이터
 */
const CodeEditor = ({ id, block }: Props) => {
  const { updateBlock, enter } = useEditor();
  const { setFocusId } = useFocusHandler();

  const isFocus = useFocusState() === id;
  const containerRef = useRef<HTMLDivElement>(null);

  // 블록이 포커스를 얻었을 때 react-simple-code-editor 내부의 textarea 엘리먼트를 찾아 포커스를 줍니다.
  useEffect(() => {
    if (isFocus && containerRef.current) {
      const textarea = containerRef.current.querySelector("textarea");
      if (textarea && document.activeElement !== textarea) {
        textarea.focus();
      }
    }
  }, [isFocus]);

  const language = block.language || "javascript";

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {/* 코드 블록 우측 상단에 표시되는 언어 선택 셀렉트 박스.
        마우스를 올렸을 때(group-hover)만 나타납니다.
      */}
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
        <select
          value={language}
          onChange={(e) => updateBlock(id, { language: e.target.value } as any)}
          className="rounded bg-[#333] px-2 py-1 text-xs text-[#E0E0E0] outline-none hover:bg-[#444] cursor-pointer border border-[#444]"
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="css">CSS</option>
          <option value="html">HTML</option>
        </select>
      </div>

      <Editor
        value={block.value}
        onValueChange={(code) => updateBlock(id, { value: code })}
        highlight={(code) => {
          // Prism.js를 사용하여 선택된 언어에 맞게 코드를 하이라이팅합니다.
          // 지원하지 않는 언어일 경우 plaintext를 적용합니다.
          const grammar =
            Prism.languages[language] || Prism.languages.plaintext;
          return Prism.highlight(code, grammar, language);
        }}
        padding={16}
        style={{
          fontFamily: '"Fira Code", "Fira Mono", monospace',
          fontSize: 14,
          minHeight: "40px",
          backgroundColor: "transparent",
          color: "white",
        }}
        className="bg-transparent"
        textareaClassName="focus:outline-none"
        onFocus={() => setFocusId(id)}
        onKeyDown={(e) => {
          // 1. Shift + Enter를 누른 경우, 코드 블록을 빠져나와 새로운 텍스트 블록을 생성합니다.
          // (코드 블록 내부에서 줄바꿈은 기본 Enter 키가 처리합니다)
          if (e.key === "Enter" && e.shiftKey) {
            e.preventDefault();
            const created = generateId();

            setFocusId(created);
            enter({ next: created, prev: id });
          }

          // 2. 코드가 비어있는 상태에서 Backspace를 누른 경우, 코드 블록을 해제하고 일반 텍스트로 변환합니다.
          if (e.key === "Backspace" && block.value === "") {
            e.preventDefault();
            updateBlock(id, { type: "text" });
          }
        }}
      />
    </div>
  );
};

export default CodeEditor;
