import { useEffect, useRef } from "react";
import { useEditor } from "../../../context/editor/hooks";
import { useFocusHandler, useFocusState } from "../../../context/focus/hooks";
import { Block, BlockType } from "../../../../types/editor/index";
import { RichText as RichTextType } from "../../../../types/editor/index";
import { getTextStyle } from "../helpers";
import {
  parseDOMToRichText,
  parseInlineMarkdown,
  richTextToHTML,
} from "../helpers";
import { MARKDOWN_RULES } from "../../../../constants/rules";
import { generateId } from "../../../../utils/id";

type Props = {
  id: string;
  value: RichTextType[];
  type: BlockType;
};

const TextEditor = ({ id, value, type }: Props) => {
  const { updateBlock, enter, deleteBlock, getPrevId } = useEditor();
  const { setFocusId } = useFocusHandler();

  const isFocus = useFocusState() === id;
  const editorRef = useRef<HTMLDivElement | null>(null);

  // [최종 해결책 1]: 한글 조합 상태와, 마지막으로 동기화된 상태값을 추적합니다.
  const isComposing = useRef(false);
  const lastSyncedValue = useRef(JSON.stringify(value));

  // [최종 해결책 2]: 컴포넌트 마운트 시, 또는 "외부(다른 블록 등)"에서 값이 변했을 때만 DOM을 그립니다.
  useEffect(() => {
    if (!editorRef.current) return;

    const currentValueStr = JSON.stringify(value);

    // 유저가 타이핑 중일 때는 이 값이 같으므로 아래 로직이 무시됩니다! (커서 튐, 씹힘 완벽 방지)
    if (lastSyncedValue.current !== currentValueStr) {
      editorRef.current.innerHTML = richTextToHTML(value);
      lastSyncedValue.current = currentValueStr;
    }
  }, [value]);

  // 포커스 처리 로직 (커서를 맨 뒤로)
  useEffect(() => {
    if (
      isFocus &&
      editorRef.current &&
      document.activeElement !== editorRef.current
    ) {
      editorRef.current.focus();
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, [isFocus]);

  // [최종 해결책 3]: 입력, 파싱, 업데이트를 담당하는 핵심 함수
  const processInput = (element: HTMLDivElement) => {
    const text = element.textContent || "";

    // 1. 블록 마크다운 검사 (#, ``` 등)
    for (const [prefix, ruleType] of Object.entries(MARKDOWN_RULES)) {
      if (text.startsWith(prefix)) {
        if (ruleType === "code") {
          updateBlock(id, {
            type: "code",
            value: text.slice(prefix.length),
            language: "javascript",
          } as unknown as Block);
          return;
        }
        updateBlock(id, {
          type: ruleType,
          value: [
            {
              text: text.slice(prefix.length),
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
              },
            },
          ],
        } as Partial<Block>);
        return;
      }
    }

    // 2. DOM 읽어오기 및 파싱
    const domRichTexts = parseDOMToRichText(element);
    const finalRichTexts = parseInlineMarkdown(domRichTexts);

    // 3. 마크다운 스타일 적용 여부 확인
    const isMarkdownApplied =
      JSON.stringify(domRichTexts) !== JSON.stringify(finalRichTexts);

    if (isMarkdownApplied) {
      // 마크다운이 적용되었다면 화면(DOM)을 강제로 덮어씌웁니다.
      element.innerHTML = richTextToHTML(finalRichTexts);

      const selection = window.getSelection();
      const range = document.createRange();

      // [핵심 해결책]: 투명 글자 없이 커서를 span 바깥으로 빼내는 마법!
      if (element.lastChild) {
        // 커서를 가장 마지막 노드(span)의 '바깥쪽 바로 뒤'에 위치시킵니다.
        range.setStartAfter(element.lastChild);
      } else {
        range.selectNodeContents(element);
      }

      range.collapse(true);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }

    // [마법의 코드]: 상태를 업데이트하기 직전에, "이건 내가 방금 동기화한 값이야!" 라고 표시를 남깁니다.
    // 이렇게 하면 상단 useEffect가 반응하지 않아서 글자가 증발하거나 씹히지 않습니다.
    lastSyncedValue.current = JSON.stringify(finalRichTexts);

    // React 전역 상태 업데이트
    updateBlock(id, { value: finalRichTexts } as Partial<Block>);
  };

  // IME(한글 조합) 이벤트 핸들러들
  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLDivElement>) => {
    isComposing.current = false;
    processInput(e.currentTarget); // 조합이 끝나면 글자를 파싱합니다.
  };

  const handleInput = (e: React.SyntheticEvent<HTMLDivElement>) => {
    // 한글 조립 중일 때는 아무것도 하지 않고 브라우저가 그리게 냅둡니다!
    if (isComposing.current) return;
    processInput(e.currentTarget);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.nativeEvent.isComposing) return;

    const textContent = e.currentTarget.textContent || "";

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const update = generateId();
      setFocusId(update);
      enter({ next: update, prev: id });
    }

    if (e.key === "Backspace" && textContent === "") {
      if (type !== "text") {
        e.preventDefault();
        updateBlock(id, { type: "text" });
        return;
      }
      if (type === "text") {
        e.preventDefault();
        const prevId = getPrevId(id);
        if (prevId != null) setFocusId(prevId);
        deleteBlock(id);
      }
    }
  };

  const sharedClasses = `block w-full p-0 break-words whitespace-pre-wrap outline-none cursor-text ${getTextStyle(type)}`;

  return (
    <div
      className="relative w-full min-h-[1.5em]"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!isFocus && target.tagName.toLowerCase() !== "a") setFocusId(id);
      }}
    >
      <div
        ref={editorRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onCompositionStart={handleCompositionStart}
        onCompositionEnd={handleCompositionEnd}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        // children이나 dangerouslySetInnerHTML은 절대 쓰지 않습니다!
        className={`resize-none bg-transparent outline-none caret-white placeholder:text-gray-400 ${sharedClasses} ${isFocus ? "text-[#D4D4D4]" : "text-gray-300"}`}
      />
    </div>
  );
};

export default TextEditor;
