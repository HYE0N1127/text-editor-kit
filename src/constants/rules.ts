import { BlockType } from "../types/editor/index";

export const MARKDOWN_RULES: Record<string, BlockType> = {
  "# ": "h1",
  "## ": "h2",
  "### ": "h3",
  "```": "code",
  "| ": "quote",
  "- ": "bullet",
};
