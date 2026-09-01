import { DragEvent, MouseEvent, ReactNode, useRef } from "react";

type Props = {
  id: string;
  children: ReactNode;
};

/**
 *
 * 드래깅을 하는 아이템의 Wrapper로 사용됩니다.
 * 드래깅의 시작과 끝 시점에 data-dragging variant를 조정합니다.
 * data-drag-handle이 붙은 요소에서 시작된 드래그만 허용합니다.
 *
 * @param id element의 id로 지정될 값
 * @returns
 */
const Dragger = ({ id, children }: Props) => {
  // mousedown 시점에 "핸들에서 눌렀는지"를 기록해둡니다.
  // dragstart 시점에는 e.target이 항상 draggable 요소 자신으로 고정되어,
  // 실제 클릭 지점을 알 수 없기 때문에 mousedown에서 미리 판별합니다.
  const canDragRef = useRef(false);

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    canDragRef.current = Boolean(target.closest("[data-drag-handle]"));
  };

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    if (!canDragRef.current) {
      e.preventDefault();
      return;
    }

    e.currentTarget.setAttribute("data-dragging", "true");
  };

  const handleDragEnd = (e: DragEvent<HTMLDivElement>) => {
    e.currentTarget.setAttribute("data-dragging", "false");
  };

  return (
    <div
      id={id}
      draggable={true}
      data-dragging="false"
      className="w-full"
      onMouseDown={handleMouseDown}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </div>
  );
};

export default Dragger;
