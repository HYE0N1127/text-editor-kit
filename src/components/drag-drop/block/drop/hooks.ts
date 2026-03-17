import { useContext, useSyncExternalStore } from "react";
import { DropContext } from "./contexts";

export const useDragContext = () => {
  const context = useContext(DropContext);

  if (context == null) {
    throw new Error("useDragContext must be used within DragProvider");
  }

  return context;
};

export const useIsClosest = (id: string) => {
  const context = useDragContext();

  return useSyncExternalStore(
    context.subscribe,
    () => context.closestId === id,
  );
};
