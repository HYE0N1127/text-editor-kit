import BulletEditor from "../../../block/editor/bullet/index";
import CodeEditor from "../../../block/editor/code/index";
import ImageEditor from "../../../block/editor/image/index";
import TextEditor from "../../../block/editor/text/index";
import Bullet from "../../../block/typography/bullet/index";
import Code from "../../../block/typography/code/index";
import Image from "../../../block/typography/image/index";
import Typography from "../../../block/typography/index";
import Quote from "../../../block/typography/quote/index";
import { useBlock } from "../../../context/editor/hooks";
import { MdDragIndicator } from "react-icons/md";
import { memo } from "react";
import { useIsClosest } from "../../../drag-drop/block/drop/hooks";
import Dragger from "../../../drag-drop/block/drag/index";

const EditorBlock = memo(({ id }: { id: string }) => {
  const { block, childrenIds } = useBlock(id);
  const isClosest = useIsClosest(id);

  const renderBlockContent = () => {
    switch (block.type) {
      case "image": {
        return (
          <Image id={id} block={block}>
            <ImageEditor id={id} />
          </Image>
        );
      }
      case "code": {
        return (
          <Code block={block}>
            <CodeEditor id={id} block={block} />
          </Code>
        );
      }
      case "quote": {
        return (
          <Quote block={block}>
            <TextEditor id={id} value={block.value} type={block.type} />
          </Quote>
        );
      }
      case "bullet": {
        return (
          <Bullet block={block}>
            <BulletEditor id={id} />
          </Bullet>
        );
      }
      default: {
        return (
          <Typography block={block}>
            <TextEditor id={id} value={block.value} type={block.type} />
          </Typography>
        );
      }
    }
  };

  return (
    <Dragger id={id}>
      <div className="group/line relative flex w-full items-start">
        {isClosest && (
          <div className="pointer-events-none absolute top-0 left-0 right-0 z-50 h-[2px] bg-blue-500" />
        )}

        <div className="absolute -left-5 top-0 bottom-0 flex items-center justify-center invisible opacity-0 transition-all duration-200 group-hover/line:visible group-hover/line:opacity-100">
          <div className="flex h-5 w-4 cursor-grab items-center justify-center rounded text-gray-400 hover:text-gray-200 transition-colors active:cursor-grabbing">
            <MdDragIndicator size={18} />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="rounded-md hover:bg-gray-800 transition-colors duration-200 my-0.5 px-1 py-0.5">
            {renderBlockContent()}
          </div>
        </div>
      </div>

      {childrenIds.length > 0 && (
        <div className="ml-6 flex flex-col gap-1 mt-1">
          {childrenIds.map((childId) => (
            <EditorBlock key={childId} id={childId} />
          ))}
        </div>
      )}
    </Dragger>
  );
});

export default EditorBlock;
