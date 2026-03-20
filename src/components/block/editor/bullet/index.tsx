import { useEffect, useRef } from "react";
import { useBlock, useEditor } from "../../../context/editor/hooks";
import { useFocusHandler, useFocusState } from "../../../context/focus/hooks";
import { TextBlock } from "../../../../types/editor/index";
import { resizeTextarea } from "../helpers";
import { generateId } from "../../../../utils/id";

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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const value = (block as TextBlock).value ?? "";

  // 텍스트 내용이 변경될 때 textarea의 높이를 자동으로 조절합니다.
  useEffect(() => {
    resizeTextarea(textareaRef.current);
  }, [value]);

  // 블록이 포커스를 얻었을 때 textarea 엘리먼트에 포커스를 주고 커서를 끝으로 이동시킵니다.
  useEffect(() => {
    if (isFocus && textareaRef.current) {
      const element = textareaRef.current;
      if (document.activeElement !== element) {
        element.focus();
        const length = element.value.length;
        element.setSelectionRange(length, length);
      }
    }
  }, [isFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    editor.updateBlock(id, { value: text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IME 조합 중 발생하는 중복 키 이벤트를 방지합니다.
    if (e.nativeEvent.isComposing) {
      return;
    }

    const isModifier = e.metaKey || e.ctrlKey;

    // 1. (Cmd/Ctrl) + Enter를 누른 경우
    // 현재 블록의 자식으로 새로운 bullet 블록을 생성합니다.
    if (isModifier && e.key === "Enter") {
      e.preventDefault();
      const newChildId = generateId();

      const update: TextBlock = {
        type: "bullet",
        value: "",
      };

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
    if (e.key === "Backspace" && value === "") {
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

  return (
    <div className="group relative flex w-full items-start py-0.5">
      <textarea
        ref={textareaRef}
        rows={1}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onFocus={() => setFocusId(id)}
        className="block w-full resize-none bg-transparent p-0 text-base leading-6 focus:outline-none placeholder:text-gray-400"
      />
    </div>
  );
};

export default BulletEditor;
