import { PropsWithChildren } from "react";
import { Block } from "../../../../types/editor/index";

type Props = {
  block: Block;
} & PropsWithChildren;

export const Quote = ({ block, children }: Props) => {
  const style = "text-base text-white w-full";

  return (
    <div className={`group relative flex w-full items-start py-1`}>
      <div className="mr-3 w-[3px] shrink-0 self-stretch rounded-full bg-gray-300 dark:bg-gray-600" />

      {children ? children : <p className={style}>{block.value}</p>}
    </div>
  );
};

export default Quote;
