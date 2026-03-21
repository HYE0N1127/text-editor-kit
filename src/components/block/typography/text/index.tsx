import { PropsWithChildren } from "react";
// [새로운 추가 내용]: RichText 타입을 가져옵니다.
import { Block, RichText } from "../../../../types/editor/index";

type Props = {
  block: Block;
} & PropsWithChildren;

const Text = ({ block, children }: Props) => {
  const styles: Record<string, string> = {
    h1: "text-4xl font-bold text-white w-full",
    h2: "text-2xl font-semibold text-white w-full",
    h3: "text-xl font-medium text-white w-full",
    quote: "text-base text-white w-full",
    text: "text-base text-white w-full",
    bullet: "text-base text-white w-full",
  };

  const className = styles[block.type] || styles.text;

  if (children) {
    return <div className={className}>{children}</div>;
  }

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

  switch (block.type) {
    case "h1":
      return <p className={className}>{renderRichText()}</p>;
    case "h2":
      return <p className={className}>{renderRichText()}</p>;
    case "h3":
      return <p className={className}>{renderRichText()}</p>;
    case "quote":
      return <p className={className}>{renderRichText()}</p>;
    default:
      return <p className={className}>{renderRichText()}</p>;
  }
};

export default Text;
