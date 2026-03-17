import { createContext } from "react";
import { Editor } from "../../../libs/editor/index";

export const MarkdownEditorContext = createContext<Editor | undefined>(
  undefined,
);
