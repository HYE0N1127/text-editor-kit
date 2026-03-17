import { useEffect, useRef } from "react";
import { useEditor } from "../../../context/editor/hooks";
import { useFocusHandler, useFocusState } from "../../../context/focus/hooks";
import { generateId } from "../../../../utils/id";

type Props = {
  id: string;
};

/**
 * 이미지 블록의 선택 및 포커스 관리를 담당하는 컴포넌트입니다.
 * 이미지 자체를 렌더링하지 않으며(외부 Image 컴포넌트가 담당), 이미지 위에 투명하게 덮여
 * 키보드 이벤트(삭제, 엔터)와 포커스 상태를 제어하는 역할을 합니다.
 *
 * @param id 해당 이미지 블록의 고유 식별자
 */
const ImageEditor = ({ id }: Props) => {
  const { setFocusId } = useFocusHandler();
  const { deleteBlock, enter } = useEditor();

  const isFocus = useFocusState() === id;
  const containerRef = useRef<HTMLDivElement | null>(null);

  // 블록이 포커스를 얻었을 때 투명한 컨테이너 엘리먼트에 포커스를 주어 키보드 이벤트를 수신할 수 있게 합니다.
  useEffect(() => {
    if (isFocus && containerRef.current) {
      containerRef.current.focus({ preventScroll: true });
    }
  }, [isFocus]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.nativeEvent.isComposing) {
      return;
    }

    // 1. Backspace 또는 Delete 키를 누른 경우 해당 이미지 블록을 삭제합니다.
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      deleteBlock(id);
    }

    // 2. Enter 키를 누른 경우 이미지 블록 아래에 새로운 블록을 생성하고 포커스를 이동시킵니다.
    if (e.key === "Enter") {
      e.preventDefault();
      const update = generateId();

      enter({ next: update, prev: id });
      setFocusId(update);
    }
  };

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        e.stopPropagation();
        setFocusId(id);
      }}
      className="absolute inset-0 z-10 outline-none cursor-default"
    />
  );
};

export default ImageEditor;
