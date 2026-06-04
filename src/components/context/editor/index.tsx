import { PropsWithChildren, useRef } from "react";
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
  const editorRef = useRef<Editor | null>(null);

  if (editorRef.current === null) {
    editorRef.current = new Editor(initial, onChange);
  }

  return (
    <MarkdownEditorContext.Provider value={editorRef.current}>
      {children}
    </MarkdownEditorContext.Provider>
  );
};
