import { BlockType } from "../../../../types/editor/index";
import { getTextStyle } from "../../editor/helpers";
import { renderFormattedText } from "./helpers";

type Props = {
  value: string;
  type: BlockType;
};

export const RichText = ({ value, type }: Props) => {
  const defaultStyle = `block w-full p-0 break-words whitespace-pre-wrap ${getTextStyle(type)}`;

  return (
    <div className={`text-[#D4D4D4] cursor-text ${defaultStyle}`}>
      {value === "" ? <br /> : renderFormattedText(value)}
    </div>
  );
};
