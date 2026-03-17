import { memo, PropsWithChildren } from "react";
import Text from "./text/index";
import { Block } from "../../../types/editor/index";

type Props = {
  block: Block;
} & PropsWithChildren;

const Typography = memo(
  ({ block, children }: Props) => {
    const validTypes = ["h1", "h2", "h3", "text"];

    if (!validTypes.includes(block.type)) {
      throw new Error(
        `Typography component only supports [h1, h2, h3, text]. Received: ${block.type}`,
      );
    }

    return (
      <div className={`group relative flex w-full items-start`}>
        <Text block={block}>{children}</Text>
      </div>
    );
  },

  (prev: Props, next: Props) =>
    prev.block.value === next.block.value &&
    prev.block.type === next.block.type,
);

export default Typography;
