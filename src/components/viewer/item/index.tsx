import { memo } from "react";
import Image from "../../block/typography/image/index";
import Code from "../../block/typography/code/index";
import Quote from "../../block/typography/quote/index";
import Bullet from "../../block/typography/bullet/index";
import Typography from "../../block/typography/index";
import CodeViewer from "../code/index";
import { State, RichText as RichTextType } from "../../../types/editor/index";
import { getAnnotationClasses } from "../../block/editor/editor.helper";

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

  /**
   * RichText 배열을 받아 화면에 렌더링하는 헬퍼 함수입니다.
   *
   * @param value 렌더링할 RichText 배열 또는 문자열 데이터
   * @returns 스타일이 적용된 span 태그 배열 또는 빈 줄 유지를 위한 공백문자
   */
  const renderRichText = (value: unknown) => {
    const richTexts = value as RichTextType[];

    // 텍스트가 배열이 아니거나 비어있을 경우, 블록의 높이 유지를 위해 공백문자를 반환합니다.
    if (!Array.isArray(richTexts) || richTexts.length === 0) {
      return "\u00A0";
    }

    return richTexts.map((rt, index) => {
      // 헬퍼 함수를 사용하여 객체를 Tailwind 클래스 문자열로 깔끔하게 변환합니다.
      const classes = getAnnotationClasses(rt.annotations);

      // 적용할 스타일이 없다면 불필요한 class 속성 없이 텍스트만 렌더링합니다.
      if (!classes) {
        return <span key={index}>{rt.text}</span>;
      }

      return (
        <span key={index} className={classes}>
          {rt.text}
        </span>
      );
    });
  };

  const renderBlockContent = () => {
    switch (block.type) {
      case "image": {
        return (
          <Image id={id} block={block}>
            {block.value ? (
              <img
                src={block.value as string}
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
        return <Quote block={block}>{renderRichText(block.value)}</Quote>;
      }
      case "bullet": {
        return <Bullet block={block}>{renderRichText(block.value)}</Bullet>;
      }
      default: {
        return (
          <Typography block={block}>{renderRichText(block.value)}</Typography>
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
