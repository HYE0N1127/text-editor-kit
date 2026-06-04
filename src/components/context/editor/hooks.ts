import { useCallback, useContext, useSyncExternalStore } from "react";
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

  const getSnapshot = useCallback(() => editor.state.nodes[id], [editor, id]);

  return useSyncExternalStore(editor.subscribe, getSnapshot);
};

export const useRootIds = () => {
  const editor = useEditor();

  const getSnapshot = useCallback(() => editor.state.rootIds, [editor]);

  return useSyncExternalStore(editor.subscribe, getSnapshot);
};
