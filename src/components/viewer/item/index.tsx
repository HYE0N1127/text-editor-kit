import { memo } from "react";
import Image from "../../block/typography/image/index";
import Code from "../../block/typography/code/index";
import Quote from "../../block/typography/quote/index";
import Bullet from "../../block/typography/bullet/index";
import Typography from "../../block/typography/index";
import CodeViewer from "../code/index";
// [새로운 추가 내용]: State와 함께 RichText 타입을 가져옵니다.
import { State, RichText as RichTextType } from "../../../types/editor/index";
// [새로운 추가 내용]: 기존에 string을 처리하던 renderFormattedText는 제거하고 컴포넌트 내부의 배열 렌더러로 대체합니다.

type Props = {
  id: string;
  nodes: State["nodes"];
};

const ViewerBlock = memo(({ id, nodes }: Props) => {
  const node = nodes[id];

  if (node == null) {
    return null;
  }

  const { block, childrenIds } = node;

  // [새로운 추가 내용]: RichText 배열을 렌더링하는 내부 헬퍼 함수입니다.
  // 텍스트가 비어있어 배열 길이가 0일 경우, 높이 유지를 위해 기존처럼 "\u00A0"를 반환합니다.
  const renderRichText = (value: unknown) => {
    const richTexts = value as RichTextType[];

    if (!Array.isArray(richTexts) || richTexts.length === 0) {
      return "\u00A0";
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

  const renderBlockContent = () => {
    switch (block.type) {
      case "image": {
        return (
          <Image id={id} block={block}>
            {block.value ? (
              <img
                src={block.value as string} // [새로운 추가 내용]: Image의 value는 string이므로 타입 단언 추가
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
        return (
          <Quote block={block}>
            {/* [새로운 추가 내용]: 내부 렌더러 함수로 대체합니다. */}
            {renderRichText(block.value)}
          </Quote>
        );
      }
      case "bullet": {
        return (
          <Bullet block={block}>
            {/* [새로운 추가 내용]: 내부 렌더러 함수로 대체합니다. */}
            {renderRichText(block.value)}
          </Bullet>
        );
      }
      default: {
        return (
          <Typography block={block}>
            {/* [새로운 추가 내용]: 내부 렌더러 함수로 대체합니다. */}
            {renderRichText(block.value)}
          </Typography>
        );
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
            <ViewerBlock key={childId} id={childId} nodes={nodes} />
          ))}
        </div>
      )}
    </div>
  );
});

export default ViewerBlock;
