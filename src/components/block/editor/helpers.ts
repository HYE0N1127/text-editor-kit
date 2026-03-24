import {
  BlockType,
  RichText,
  TextAnnotations,
} from "../../../types/editor/index";

export const resizeTextarea = (ref: HTMLTextAreaElement | null) => {
  if (ref) {
    ref.style.height = "auto";
    ref.style.height = `${ref.scrollHeight}px`;
  }
};

export const getTextStyle = (type: BlockType) => {
  switch (type) {
    case "h1":
      return "text-4xl font-bold mt-8 mb-4 text-white";
    case "h2":
      return "text-3xl font-bold mt-6 mb-3 text-white";
    case "h3":
      return "text-2xl font-bold mt-4 mb-2 text-white";
    default:
      return "text-base text-[#D4D4D4]";
  }
};
