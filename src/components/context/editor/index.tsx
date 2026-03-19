import { PropsWithChildren, useMemo } from "react";
import { Editor } from "../../../libs/editor/index";
import { MarkdownEditorContext } from "./contexts";
import { State } from "../../../types/editor/index";

export type Props = PropsWithChildren & {
  initial?: State;
  onChange?: (state: State) => void;
};

export const MarkdownEditorProvider = ({
  children,
  initial,
  onChange,
}: Props) => {
  const value = useMemo(() => new Editor(initial, onChange), []);

  return (
    <MarkdownEditorContext.Provider value={value}>
      {children}
    </MarkdownEditorContext.Provider>
  );
};
