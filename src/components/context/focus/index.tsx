import { PropsWithChildren, useState } from "react";
import { FocusHandlerContext, FocusStateContext } from "./contexts";

export const FocusProvider = ({ children }: PropsWithChildren) => {
  const [focusId, setFocusId] = useState<string | undefined>(undefined);

  return (
    <FocusStateContext.Provider value={{ focusId }}>
      <FocusHandlerContext.Provider value={{ setFocusId }}>
        {children}
      </FocusHandlerContext.Provider>
    </FocusStateContext.Provider>
  );
};
