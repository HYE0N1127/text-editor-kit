import { PropsWithChildren } from "react";
import { useFocusState } from "../../../context/focus/hooks";
import { ImageBlock } from "../../../../types/editor/index";

type Props = {
  id: string;
  block: ImageBlock;
} & PropsWithChildren;

const Image = ({ id, block, children }: Props) => {
  const isFocus = useFocusState() === id;

  if (block.isLoading) {
    return (
      <div className="w-full flex justify-center items-center py-10 select-none">
        <div className="p-3 rounded-full shadow-sm">
          <svg
            className="animate-spin h-6 w-6 text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="relative max-w-full rounded-lg transition-all group select-none">
      {isFocus && (
        <div className="absolute inset-0 bg-blue-500/95 rounded-lg pointer-events-none z-0" />
      )}

      <img
        src={block.value}
        alt="image"
        className="block max-w-full h-auto rounded-lg shadow-sm relative z-0"
      />

      {children}
    </div>
  );
};

export default Image;
