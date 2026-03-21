import { PropsWithChildren } from "react";
// [새로운 추가 내용]: RichText 타입을 가져옵니다.
import { Block, RichText } from "../../../../types/editor/index";

type Props = {
  block: Block;
} & PropsWithChildren;

export const Quote = ({ block, children }: Props) => {
  const style = "text-base text-white w-full";

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
    <div className={`group relative flex w-full items-start py-1`}>
      <div className="mr-3 w-[3px] shrink-0 self-stretch rounded-full bg-gray-300 dark:bg-gray-600" />
      {children ? children : <p className={style}>{renderRichText()}</p>}
    </div>
  );
};

export default Quote;
