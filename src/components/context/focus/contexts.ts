import { createContext, Dispatch, SetStateAction } from "react";

export const FocusStateContext = createContext<{
  focusId: string | undefined;
} | null>(null);

export const FocusHandlerContext = createContext<{
  setFocusId: Dispatch<SetStateAction<string | undefined>>;
} | null>(null);
