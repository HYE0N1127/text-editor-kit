import { PropsWithChildren } from "react";
import { Block, RichText } from "../../../../types/editor/index";

type Props = {
  block: Block;
} & PropsWithChildren;

export const Bullet = ({ block, children }: Props) => {
  const style = "text-base text-[var(--editor-text)] w-full";

  const richTexts = block.value as RichText[];

  const renderRichText = () => {
    if (!Array.isArray(richTexts)) {
      return null;
    }
    return richTexts.map((rt, index) => (
      <span
        key={index}
        className={`
          ${rt.annotations.bold ? "font-bold" : ""} 
          ${rt.annotations.italic ? "italic" : ""}
          ${rt.annotations.underline ? "underline" : ""}
          ${rt.annotations.strikethrough ? "line-through" : ""}
        `}
      >
        {rt.text}
      </span>
    ));
  };

  return (
    <div
      className={`group relative flex w-full items-start py-0.5 text-[var(--editor-text-focused)]`}
    >
      <div className="mr-2 mt-0.5 flex h-6 w-5 shrink-0 items-center justify-center select-none">
        <div className="h-1.5 w-1.5 rounded-full bg-[var(--editor-bullet-dot)]" />
      </div>

      {children ? children : <p className={style}>{renderRichText()}</p>}
    </div>
  );
};

export default Bullet;
