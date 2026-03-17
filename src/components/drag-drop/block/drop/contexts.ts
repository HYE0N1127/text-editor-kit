import { createContext } from "react";
import { DragAndDrop } from "../../../../libs/drag-drop/index";

export const DropContext = createContext<DragAndDrop | null>(null);
