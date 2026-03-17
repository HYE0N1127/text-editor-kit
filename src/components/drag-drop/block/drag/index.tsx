import { DragEvent, ReactNode } from "react";

type Props = {
  id: string;
  children: ReactNode;
};

/**
 *
 * 드래깅을 하는 아이템의 Wrapper로 사용됩니다.
 * 드래깅의 시작과 끝 시점에 data-dragging variant를 조정합니다.
 *
 * @param id element의 id로 지정될 값
 * @returns
 */
const Dragger = ({ id, children }: Props) => {
  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
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
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </div>
  );
};

export default Dragger;
