import { useEffect, useRef } from "react";
import { useEditor } from "../../../context/editor/hooks";
import { useFocusHandler, useFocusState } from "../../../context/focus/hooks";
import {
  Block,
  BlockType,
  RichText as RichTextType,
} from "../../../../types/editor/index";
import { MARKDOWN_RULES } from "../../../../constants/rules";
import { generateId } from "../../../../utils/id";
import {
  getCaretPosition,
  parseDOMToRichText,
  parseInlineMarkdown,
  richTextToHTML,
  setCaretPosition,
} from "../editor.helper";
import { getTextStyle } from "../helpers";

// 브라우저 호환성을 위해 사용하는 투명 텍스트입니다.
const ZWS = "\uFEFF";

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

  // 한글 등 조합형 언어의 입력 상태를 추적합니다.
  const isComposing = useRef(false);

  // 마지막으로 동기화된 상태값을 저장하여 불필요한 렌더링을 방지합니다.
  const lastSyncedValue = useRef(JSON.stringify(value));

  useEffect(() => {
    if (!editorRef.current) return;
    const currentValueStr = JSON.stringify(value);

    // 상태값이 변경되었을 경우, 에디터 내부의 HTML을 업데이트합니다.
    if (lastSyncedValue.current !== currentValueStr) {
      // DOM을 덮어씌우기 직전에 현재 커서 위치를 저장합니다.
      const currentCaretOffset = getCaretPosition(editorRef.current);

      editorRef.current.innerHTML = richTextToHTML(value);
      lastSyncedValue.current = currentValueStr;

      // 렌더링 이후에 커서 위치를 다시 복구합니다.
      setCaretPosition(editorRef.current, currentCaretOffset);
    }
  }, [value]);

  useEffect(() => {
    // 포커스를 얻었을 때, 에디터 영역으로 커서를 이동시킵니다.
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

  const processInput = (element: HTMLDivElement, isComposingNow = false) => {
    // 커서 보정을 위해 투명 텍스트를 제외한 순수 텍스트의 길이를 미리 계산합니다.
    const text = (element.textContent || "").replace(new RegExp(ZWS, "g"), "");
    const oldLength = text.length;

    // 한글 조합 중이 아닐 때만 블록 마크다운 문법을 검사합니다.
    if (!isComposingNow) {
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
    }

    const domRichTexts = parseDOMToRichText(element);

    // 한글 조합 중일 경우, DOM 렌더링 갱신 없이 상태값만 업데이트합니다.
    if (isComposingNow) {
      const composingRichTexts = domRichTexts
        .map((seg) => ({
          ...seg,
          text: seg.text.replace(new RegExp(ZWS, "g"), ""),
        }))
        .filter((seg) => seg.text.length > 0);

      lastSyncedValue.current = JSON.stringify(composingRichTexts);
      updateBlock(id, { value: composingRichTexts as any });
      return;
    }

    // 텍스트 내부의 인라인 마크다운 요소들을 찾아 스타일 객체로 변환합니다.
    let finalRichTexts = parseInlineMarkdown(domRichTexts)
      .map((seg) => ({
        ...seg,
        text: seg.text.replace(new RegExp(ZWS, "g"), ""),
      }))
      .filter((seg) => seg.text.length > 0);

    const isMarkdownApplied =
      JSON.stringify(domRichTexts) !== JSON.stringify(finalRichTexts);

    // 인라인 마크다운이 적용되어 텍스트 구조가 변경되었을 경우에만 렌더링을 갱신합니다.
    if (isMarkdownApplied) {
      // DOM 구조가 변경되기 전의 커서 위치를 기억합니다.
      const oldOffset = getCaretPosition(element);

      // 마크다운 파싱 후 사라진 텍스트의 길이를 계산합니다.
      const newLength = finalRichTexts.reduce(
        (acc, seg) => acc + seg.text.length,
        0,
      );
      const diff = oldLength - newLength;

      element.innerHTML = richTextToHTML(finalRichTexts);

      // 기호가 사라진 길이만큼 계산하여 커서 위치를 보정합니다.
      setCaretPosition(element, Math.max(0, oldOffset - diff));
    }

    lastSyncedValue.current = JSON.stringify(finalRichTexts);
    updateBlock(id, { value: finalRichTexts } as Partial<Block>);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      return;
    }

    const { anchorNode, anchorOffset } = selection;
    const textContent = (e.currentTarget.textContent || "").replace(
      new RegExp(ZWS, "g"),
      "",
    );

    // 사용자의 커서가 임시로 생성된 투명 텍스트에 위치할 때의 동작을 제어합니다.
    if (
      anchorNode?.nodeType === Node.TEXT_NODE &&
      anchorNode.textContent === ZWS
    ) {
      // 왼쪽 화살표를 누른 경우 텍스트 변경 없이 커서만 이동시킵니다.
      if (e.key === "ArrowLeft") {
        e.preventDefault();

        const prevSibling = anchorNode.previousSibling;
        (anchorNode as ChildNode).remove();

        // 투명 텍스트를 지우고 커서를 바로 앞 요소의 끝부분으로 이동시킵니다.
        if (prevSibling) {
          const newRange = document.createRange();
          newRange.selectNodeContents(prevSibling);
          newRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(newRange);
        }
        return;
      }

      // 백스페이스를 누른 경우 앞의 텍스트도 함께 삭제합니다.
      if (e.key === "Backspace") {
        e.preventDefault();

        const prevSibling = anchorNode.previousSibling;
        (anchorNode as ChildNode).remove();

        // 투명 텍스트를 지우고, 이전 요소의 텍스트 한 글자를 함께 지운 뒤 커서를 이동시킵니다.
        if (prevSibling) {
          const text = prevSibling.textContent || "";
          if (text.length > 0) {
            prevSibling.textContent = text.slice(0, -1);
          }

          const newRange = document.createRange();
          newRange.selectNodeContents(prevSibling);
          newRange.collapse(false);
          selection.removeAllRanges();
          selection.addRange(newRange);

          // 강제로 DOM을 조작했으므로 상태 동기화를 위해 입력 처리 함수를 호출합니다.
          processInput(e.currentTarget);
        }
        return;
      }
    }

    // 커서가 스타일 텍스트의 끝에 있을 때 오른쪽 화살표 키로 탈출할 수 있도록 지원합니다.
    if (e.key === "ArrowRight") {
      const targetNode =
        anchorNode?.nodeType === Node.TEXT_NODE
          ? anchorNode
          : selection.focusNode;

      if (targetNode && targetNode.parentNode) {
        const parent = targetNode.parentNode as HTMLElement;

        if (parent.tagName === "SPAN") {
          const isAtEnd =
            anchorOffset === (targetNode.textContent?.length || 0);

          if (isAtEnd) {
            e.preventDefault();
            let nextNode = parent.nextSibling;

            // 탈출을 위한 투명 텍스트 공간을 생성합니다.
            if (!nextNode || nextNode.nodeType !== Node.TEXT_NODE) {
              nextNode = document.createTextNode(ZWS);
              parent.parentNode?.insertBefore(nextNode, parent.nextSibling);
            }

            const newRange = document.createRange();
            newRange.setStart(nextNode, 1);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
            return;
          }
        }
      }
    }

    // 엔터키 입력 시 새로운 블럭을 생성합니다.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      const update = generateId();
      setFocusId(update);
      enter({ next: update, prev: id });
    }

    // 블럭이 비어있는 상태에서 백스페이스를 눌렀을 때의 동작을 처리합니다.
    if (e.key === "Backspace" && textContent === "") {
      // 일반 텍스트가 아닌 블럭일 경우, 일반 텍스트 블럭으로 초기화합니다.
      if (type !== "text") {
        e.preventDefault();
        updateBlock(id, { type: "text" });
        return;
      }

      // 이미 일반 텍스트 블럭일 경우, 블럭을 삭제하고 포커스를 이전 블럭으로 이동시킵니다.
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
        onCompositionStart={() => (isComposing.current = true)}
        onCompositionEnd={(e) => {
          isComposing.current = false;
          processInput(e.currentTarget);
        }}
        onInput={(e) => {
          if (isComposing.current) {
            return;
          }

          processInput(e.currentTarget);
        }}
        onKeyDown={handleKeyDown}
        spellCheck={false}
        className={`resize-none bg-transparent outline-none caret-white placeholder:text-gray-400 ${sharedClasses} ${isFocus ? "text-[#D4D4D4]" : "text-gray-300"}`}
      />
    </div>
  );
};

export default TextEditor;
