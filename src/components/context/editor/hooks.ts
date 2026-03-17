import { useContext, useSyncExternalStore } from "react";
import { MarkdownEditorContext } from "./contexts";

export const useEditor = () => {
  const editor = useContext(MarkdownEditorContext);

  if (editor == null) {
    throw new Error("useEditor must be used within a MarkdownEditorProvider");
  }

  return editor;
};

export const useBlock = (id: string) => {
  const editor = useEditor();

  return useSyncExternalStore(editor.subscribe, () => editor.state.nodes[id]);
};

export const useRootIds = () => {
  const editor = useEditor();

  return useSyncExternalStore(editor.subscribe, () => editor.state.rootIds);
};
