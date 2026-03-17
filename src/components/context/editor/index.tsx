import { PropsWithChildren, useMemo } from "react";
import { Editor } from "../../../libs/editor/index";
import { MarkdownEditorContext } from "./contexts";

export const MarkdownEditorProvider = ({ children }: PropsWithChildren) => {
  const value = useMemo(() => new Editor(), []);

  return (
    <MarkdownEditorContext.Provider value={value}>
      {children}
    </MarkdownEditorContext.Provider>
  );
};
