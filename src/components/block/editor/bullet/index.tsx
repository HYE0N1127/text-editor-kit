import { useEffect, useRef } from "react";
import { useBlock, useEditor } from "../../../context/editor/hooks";
import { useFocusHandler, useFocusState } from "../../../context/focus/hooks";
import {
  TextBlock,
  RichText as RichTextType,
} from "../../../../types/editor/index";
import { parseDOMToRichText, parseInlineMarkdown } from "../helpers";
import { generateId } from "../../../../utils/id";

/**
 * TextEditor랑 합칠만한듯, 한 추상클래스로 묶어보기
 */
type Props = {
  id: string;
};

/**
 * 글머리 기호(Bullet) 블록의 편집을 담당하는 컴포넌트입니다.
 * 순서 없는 목록(`<ul>`, `<li>` 형태)의 텍스트 입력과 들여쓰기/내어쓰기 로직을 처리합니다.
 *
 * @param id 해당 블록의 고유 식별자
 */
const BulletEditor = ({ id }: Props) => {
  const editor = useEditor();
  const { block, parentId } = useBlock(id);
  const { setFocusId } = useFocusHandler();

  const isFocus = useFocusState() === id;
  const editorRef = useRef<HTMLDivElement | null>(null);

  // [새로운 추가 내용]: value를 string이 아닌 RichTextType[]으로 처리합니다.
  const value = (block.value as unknown as RichTextType[]) || [];

  // 텍스트 내용이 변경될 때 textarea의 높이를 자동으로 조절합니다.
  // [새로운 추가 내용]: contentEditable div는 자동 확장되므로 resizeTextarea가 불필요하여 제거했습니다.
  useEffect(() => {
    // resizeTextarea(textareaRef.current);
  }, [value]);

  // 블록이 포커스를 얻었을 때 textarea 엘리먼트에 포커스를 주고 커서를 끝으로 이동시킵니다.
  useEffect(() => {
    if (isFocus && editorRef.current) {
      const element = editorRef.current;
      if (document.activeElement !== element) {
        element.focus();

        // [새로운 추가 내용]: Selection API로 커서를 끝으로 이동
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(element);
        range.collapse(false);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
    }
  }, [isFocus]);

  // [새로운 추가 내용]: ChangeEvent 대신 SyntheticEvent 사용 및 파서 로직 적용
  const handleInput = (e: React.SyntheticEvent<HTMLDivElement>) => {
    const domRichTexts = parseDOMToRichText(e.currentTarget);
    const finalRichTexts = parseInlineMarkdown(domRichTexts);

    // [새로운 추가 내용]: Block 타입 구조에 맞게 캐스팅하여 업데이트
    editor.updateBlock(id, { value: finalRichTexts as any });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // IME 조합 중 발생하는 중복 키 이벤트를 방지합니다.
    if (e.nativeEvent.isComposing) {
      return;
    }

    const isModifier = e.metaKey || e.ctrlKey;
    const textContent = e.currentTarget.textContent || "";

    // 1. (Cmd/Ctrl) + Enter를 누른 경우
    // 현재 블록의 자식으로 새로운 bullet 블록을 생성합니다.
    if (isModifier && e.key === "Enter") {
      e.preventDefault();
      const newChildId = generateId();

      const update = {
        type: "bullet",
        value: [], // [새로운 추가 내용]: 빈 배열로 초기화
      } as unknown as TextBlock;

      editor.addChild(id, update, newChildId);
      setFocusId(newChildId);

      return;
    }

    // 2. 일반 Enter를 누른 경우
    // 현재 블록과 같은 레벨(형제)로 새로운 bullet 블록을 생성합니다.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const newId = generateId();

      editor.enter({ next: newId, prev: id, type: "bullet" });
      setFocusId(newId);

      return;
    }

    // 3. 텍스트가 비어있는 상태에서 Backspace를 누른 경우
    // [새로운 추가 내용]: value === "" 대신 textContent === ""로 체크합니다.
    if (e.key === "Backspace" && textContent === "") {
      e.preventDefault();

      // 최상위 루트에 존재하는 경우, bullet 타입을 해제하고 일반 텍스트 블록으로 전환합니다.
      if (parentId == null && block.type !== "text") {
        editor.updateBlock(id, { type: "text" });
        return;
      }

      // 그렇지 않은 경우 현재 블록을 삭제하고 이전 블록으로 포커스를 이동시킵니다.
      const prevId = editor.getPrevId(id);

      if (prevId != null) {
        setFocusId(prevId);
      }

      editor.deleteBlock(id);
      return;
    }
  };

  const renderRichText = () => {
    if (!value || value.length === 0) return null;
    return value.map((richText, index) => (
      <span
        key={index}
        className={`
          ${richText.annotations.bold ? "font-bold" : ""} 
          ${richText.annotations.italic ? "italic" : ""}
          ${richText.annotations.underline ? "underline" : ""}
          ${richText.annotations.strikethrough ? "line-through" : ""}
        `}
      >
        {richText.text}
      </span>
    ));
  };

  return (
    <div
      className="group relative flex w-full items-start gap-2 py-0.5"
      onClick={(e) => {
        if (!isFocus) setFocusId(id);
      }}
    >
      {/* [새로운 추가 내용]: 좌측의 불릿 점 아이콘 */}
      <span className="select-none mt-[0.3em] text-xl leading-none">•</span>
      <div
        ref={editorRef}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className={`block flex-1 w-full resize-none bg-transparent p-0 text-base leading-6 focus:outline-none placeholder:text-gray-400 break-words whitespace-pre-wrap outline-none caret-white cursor-text ${isFocus ? "text-[#D4D4D4]" : "text-gray-300"}`}
      >
        {renderRichText()}
      </div>
    </div>
  );
};

export default BulletEditor;
