export type Node = {
  id: string;
  block: Block;
  parentId: string | null;
  childrenIds: string[];
};

export type State = {
  nodes: Record<string, Node>;
  rootIds: string[];
};

export type TextBlock = {
  type: "text" | "h1" | "h2" | "h3" | "bullet" | "quote";
  value: string;
};

export type ImageBlock = {
  type: "image";
  value: string;
  isLoading?: boolean;
  width?: number;
  height?: number;
};

export type CodeBlock = {
  type: "code";
  value: string;
  language: string;
};

export type Block = TextBlock | ImageBlock | CodeBlock;

export type BlockType = Block["type"];
