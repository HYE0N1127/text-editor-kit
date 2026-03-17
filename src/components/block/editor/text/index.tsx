import { useEffect, useRef } from "react";
import { useEditor } from "../../../context/editor/hooks";
import { useFocusHandler, useFocusState } from "../../../context/focus/hooks";
import { Block, BlockType } from "../../../../types/editor/index";
import { getTextStyle, resizeTextarea } from "../helpers";
import { MARKDOWN_RULES } from "../../../../constants/rules";
import { generateId } from "../../../../utils/id";
import { RichText } from "../../typography/rich-text/index";

type Props = {
  id: string;
  value: string;
  type: BlockType;
};

/**
 * 텍스트 블록 에디터 컴포넌트입니다.
 *
 * @param id 해당 블록의 고유 식별자
 * @param value 블록 내부에 입력된 텍스트 내용
 * @param type 블록의 현재 타입 (예: text, h1 등)
 */
const TextEditor = ({ id, value, type }: Props) => {
  const { updateBlock, enter, deleteBlock, getPrevId } = useEditor();
  const { setFocusId } = useFocusHandler();

  const isFocus = useFocusState() === id;
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // 텍스트 내용이 변경되거나 포커스를 얻었을 때 textarea의 높이를 자동으로 조절합니다.
  useEffect(() => {
    if (isFocus) {
      resizeTextarea(textareaRef.current);
    }
  }, [value, isFocus]);

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

    // 유저가 입력한 텍스트가 특정 마크다운 규칙(예: '# ', '```')으로 시작하는지 확인합니다.
    for (const [prefix, ruleType] of Object.entries(MARKDOWN_RULES)) {
      if (text.startsWith(prefix)) {
        if (ruleType === "code") {
          // 코드 블록 규칙에 일치하는 경우, 트리거된 기호를 잘라내고 언어가 설정된 코드 블록 타입으로 변환합니다.
          updateBlock(id, {
            type: "code",
            value: text.slice(prefix.length),
            language: "javascript",
          } as Block);

          return;
        }

        // 일반 마크다운 블록 규칙에 일치하는 경우 해당 타입으로 블록을 업데이트합니다.
        updateBlock(id, { type: ruleType, value: text.slice(prefix.length) });
        return;
      }
    }

    // 마크다운 문법에 해당하지 않는 경우 텍스트 값만 업데이트합니다.
    updateBlock(id, { value: text });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // IME 조합 중 발생하는 중복 키 이벤트를 방지합니다.
    if (e.nativeEvent.isComposing) {
      return;
    }

    // 1. Enter를 누른 경우 새로운 텍스트 블록을 생성하고 포커스를 이동시킵니다.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const update = generateId();

      setFocusId(update);
      enter({ next: update, prev: id });
    }

    // 2. 텍스트가 비어있는 상태에서 Backspace를 누른 경우
    if (e.key === "Backspace" && value === "") {
      // 블록 타입이 h1, h2 등이면 블록을 삭제하지 않고 일반 텍스트 타입으로 초기화합니다.
      if (type !== "text") {
        e.preventDefault();

        updateBlock(id, { type: "text" });
        return;
      }

      // 현재 블록이 이미 일반 텍스트 타입인 경우 블록을 삭제하고 이전 블록으로 포커스를 이동시킵니다.
      if (type === "text") {
        e.preventDefault();
        const prevId = getPrevId(id);

        if (prevId != null) {
          setFocusId(prevId);
        }

        deleteBlock(id);
      }
    }
  };

  const sharedClasses = `block w-full p-0 break-words whitespace-pre-wrap ${getTextStyle(type)}`;

  return (
    <div
      className="relative w-full min-h-[1.5em]"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        // 뷰어 모드에서 텍스트 영역을 클릭한 경우 포커스를 부여하여 편집 모드로 전환합니다.
        // 단, 클릭한 대상이 하이퍼링크인 경우 모드를 전환하지 않고 링크 이동을 허용합니다.
        if (!isFocus && target.tagName.toLowerCase() !== "a") {
          setFocusId(id);
        }
      }}
    >
      {isFocus ? (
        <textarea
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className={`resize-none bg-transparent text-[#D4D4D4] caret-white focus:outline-none placeholder:text-gray-400 ${sharedClasses}`}
        />
      ) : (
        <RichText value={value} type={type} />
      )}
    </div>
  );
};

export default TextEditor;
