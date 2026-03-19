import { memo } from "react";
import { useBlock } from "../../context/editor/hooks";
import Image from "../../block/typography/image/index";
import Code from "../../block/typography/code/index";
import Quote from "../../block/typography/quote/index";
import Bullet from "../../block/typography/bullet/index";
import Typography from "../../block/typography/index";
import CodeViewer from "../code/index";

const ViewerBlock = memo(({ id }: { id: string }) => {
  const { block, childrenIds } = useBlock(id);

  const renderBlockContent = () => {
    switch (block.type) {
      case "image": {
        return (
          <Image id={id} block={block}>
            {block.value ? (
              <img
                src={block.value}
                alt="업로드된 이미지"
                className="max-w-full rounded-md"
              />
            ) : (
              <div className="w-full h-20 bg-gray-100 dark:bg-gray-800 rounded-md animate-pulse" />
            )}
          </Image>
        );
      }
      case "code": {
        return (
          <Code block={block}>
            <CodeViewer block={block} />
          </Code>
        );
      }
      case "quote": {
        return <Quote block={block}>{block.value || "\u00A0"}</Quote>;
      }
      case "bullet": {
        return <Bullet block={block}>{block.value || "\u00A0"}</Bullet>;
      }
      default: {
        return <Typography block={block}>{block.value || "\u00A0"}</Typography>;
      }
    }
  };

  return (
    <div className="w-full">
      <div className="relative flex w-full items-start">
        <div className="flex-1 min-w-0">
          <div className="rounded-md my-0.5 px-1 py-0.5">
            {renderBlockContent()}
          </div>
        </div>
      </div>

      {childrenIds.length > 0 && (
        <div className="ml-6 flex flex-col gap-1 mt-1">
          {childrenIds.map((childId) => (
            <ViewerBlock key={childId} id={childId} />
          ))}
        </div>
      )}
    </div>
  );
});

export default ViewerBlock;
