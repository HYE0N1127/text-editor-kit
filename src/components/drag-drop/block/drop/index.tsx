import {
  ComponentPropsWithRef,
  DragEvent,
  ElementType,
  PropsWithChildren,
  useMemo,
  useRef,
} from "react";
import { useDragContext } from "./hooks";
import { DragAndDrop } from "../../../../libs/drag-drop/index";
import { DropContext } from "./contexts";

export const DragAndDropProvider = ({ children }: PropsWithChildren) => {
  const focus = useMemo(() => new DragAndDrop(), []);

  return <DropContext.Provider value={focus}>{children}</DropContext.Provider>;
};

type Props<T extends ElementType> = {
  as?: T;
  onDrop?: (activeId: string, closestId: string) => void;
} & Omit<ComponentPropsWithRef<T>, "as" | "onDrop">;

/**
 * Drop이 일어나는 영역을 담당합니다
 *
 * @param as? : Div 이외의 형태를 사용하고 싶은 경우 추가합니다. (ex. ul)
 * @param onDrop : drop이 일어나는 시점에 실행할 콜백 함수
 *
 * @example
 * <DropZone as="ul">
 */
export const DropZone = <T extends ElementType = "div">({
  as,
  children,
  onDrop,
  ...rest
}: Props<T>) => {
  const Component = as || "div";
  const ref = useRef<HTMLDivElement | null>(null);
  const context = useDragContext();

  const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
    const targetBlock = e.target as HTMLElement;

    if (targetBlock && targetBlock.id) {
      context.dragStart(targetBlock.id);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    if (ref.current == null) {
      return;
    }

    context.dragOver(e.clientY, ref.current);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    // DropZone 내부의 아이템에 마우스가 올라가 DragLeave 이벤트가 동작하는 경우를 방지합니다.
    if (ref.current?.contains(e.relatedTarget as Node)) {
      return;
    }

    context.dragLeave();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const activeId = context.activeId;
    const closestId = context.closestId;

    if (activeId && closestId) {
      onDrop?.(activeId, closestId);
    }

    context.dragEnd();
  };

  return (
    <Component
      ref={ref}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...rest}
    >
      {children}
    </Component>
  );
};
