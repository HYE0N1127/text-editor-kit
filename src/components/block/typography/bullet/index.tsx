import { PropsWithChildren } from "react";
import { Block } from "../../../../types/editor/index";

type Props = {
  block: Block;
} & PropsWithChildren;

export const Bullet = ({ block, children }: Props) => {
  const style = "text-base text-white w-full";

  return (
    <div className={`group relative flex w-full items-start py-0.5`}>
      {children ? children : <p className={style}>{block.value}</p>}
    </div>
  );
};

export default Bullet;
