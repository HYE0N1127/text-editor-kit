import {
  TextAnnotations,
  RichText as RichTextType,
} from "../../../types/editor/index";

/**
 * 브라우저 호환성 및 커서 이동 UX 개선을 위해 사용하는 투명 텍스트입니다.
 */
export const ZWS = "\uFEFF";

/**
 * 인라인 마크다운 문법을 추출하기 위한 정규표현식입니다.
 */
const MARKDOWN_REGEX =
  /(\*\*.+?\*\*|__.+?__|~~.+?~~|\*[^\*]+\*|\[.+?\]\(.+?\))/g;

/**
 * 텍스트에 적용된 스타일 속성을 Tailwind CSS 클래스 문자열로 변환합니다.
 *
 * @param annotations 텍스트의 스타일 속성 객체
 * @returns 적용할 CSS 클래스 문자열
 */
export const getAnnotationClasses = (annotations: TextAnnotations): string => {
  return [
    annotations.bold ? "font-bold" : "",
    annotations.italic ? "italic" : "",
    annotations.underline ? "underline underline-offset-4" : "",
    annotations.strikethrough ? "line-through" : "",
  ]
    .filter(Boolean)
    .join(" ");
};

/**
 * 에디터의 상태 객체 배열을 HTML 문자열로 변환하여 렌더링합니다.
 *
 * @param segments 스타일이 적용된 텍스트 상태 배열
 * @returns 렌더링 가능한 HTML 문자열
 */
export const richTextToHTML = (segments: RichTextType[]): string => {
  if (!segments || segments.length === 0) {
    return "<br>";
  }

  return segments
    .map((seg) => {
      const classes = getAnnotationClasses(seg.annotations);

      if (classes == null) {
        return seg.text;
      }

      return `<span class="${classes}">${seg.text}</span>`;
    })
    .join("");
};

/**
 * HTML DOM 요소를 깊이 탐색하여 텍스트와 적용된 스타일을 상태 객체 배열로 역변환합니다.
 * 부모 요소의 스타일이 자식 요소에게 온전히 상속되도록 처리합니다.
 *
 * @param container 파싱할 대상 HTML 요소
 * @returns 추출된 텍스트 상태 배열
 */
export const parseDOMToRichText = (container: HTMLElement): RichTextType[] => {
  const segments: RichTextType[] = [];

  const traverseNode = (node: Node, parentAnnotations: TextAnnotations) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent || "";

      if (text) {
        segments.push({ text, annotations: { ...parentAnnotations } });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;

      const isBold =
        el.tagName === "B" ||
        el.tagName === "STRONG" ||
        el.classList.contains("font-bold");
      const isItalic =
        el.tagName === "I" ||
        el.tagName === "EM" ||
        el.classList.contains("italic");
      const isUnderline =
        el.tagName === "U" || el.classList.contains("underline");
      const isStrikethrough =
        el.tagName === "S" ||
        el.tagName === "STRIKE" ||
        el.classList.contains("line-through");

      const currentAnnotations = {
        bold: !!isBold || parentAnnotations.bold,
        italic: !!isItalic || parentAnnotations.italic,
        underline: !!isUnderline || parentAnnotations.underline,
        strikethrough: !!isStrikethrough || parentAnnotations.strikethrough,
      };

      el.childNodes.forEach((child) => {
        traverseNode(child, currentAnnotations);
      });
    }
  };

  container.childNodes.forEach((child) => {
    traverseNode(child, {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
    });
  });

  return segments;
};

/**
 * 텍스트 조각 내에 포함된 마크다운 기호를 해석하여 스타일이 적용된 상태 객체로 변환합니다.
 *
 * @param segments 마크다운 기호가 포함된 원본 텍스트 상태 배열
 * @returns 마크다운이 스타일 속성으로 변환된 텍스트 상태 배열
 */
export const parseInlineMarkdown = (
  segments: RichTextType[],
): RichTextType[] => {
  const result: RichTextType[] = [];

  segments.forEach((seg) => {
    const parts = seg.text.split(MARKDOWN_REGEX);

    parts.forEach((part) => {
      if (!part) {
        return;
      }

      const ann = { ...seg.annotations };
      let text = part;

      if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
        ann.bold = true;
        text = part.slice(2, -2);
      } else if (
        part.startsWith("__") &&
        part.endsWith("__") &&
        part.length >= 4
      ) {
        ann.underline = true;
        text = part.slice(2, -2);
      } else if (
        part.startsWith("~~") &&
        part.endsWith("~~") &&
        part.length >= 4
      ) {
        ann.strikethrough = true;
        text = part.slice(2, -2);
      } else if (
        part.startsWith("*") &&
        part.endsWith("*") &&
        part.length >= 2
      ) {
        ann.italic = true;
        text = part.slice(1, -1);
      }

      if (text) {
        result.push({ text, annotations: ann });
      }
    });
  });

  // 인접한 텍스트 조각 중 동일한 스타일을 가진 조각들을 하나로 병합하여 최적화합니다.
  return result.reduce((acc: RichTextType[], curr) => {
    if (acc.length === 0) {
      return [curr];
    }

    const prev = acc[acc.length - 1];

    if (
      prev.annotations.bold === curr.annotations.bold &&
      prev.annotations.italic === curr.annotations.italic &&
      prev.annotations.underline === curr.annotations.underline &&
      prev.annotations.strikethrough === curr.annotations.strikethrough
    ) {
      prev.text += curr.text;
    } else {
      acc.push(curr);
    }

    return acc;
  }, []);
};

/**
 * 편집 영역 내에서 현재 커서의 절대적인 텍스트 위치를 계산합니다.
 *
 * @param element 기준이 되는 에디터 컨테이너 요소
 * @returns 컨테이너 내 커서의 텍스트 오프셋 인덱스
 */
export const getCaretPosition = (element: HTMLElement): number => {
  let caretOffset = 0;
  const doc = element.ownerDocument || document;
  const win = doc.defaultView || window;
  const sel = win.getSelection();

  if (sel && sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    const preCaretRange = range.cloneRange();

    preCaretRange.selectNodeContents(element);
    preCaretRange.setEnd(range.endContainer, range.endOffset);
    caretOffset = preCaretRange.toString().length;
  }

  return caretOffset;
};

/**
 * 지정된 텍스트 오프셋 위치로 커서를 강제로 이동시킵니다. DOM 렌더링 이후 커서를 복구할 때 사용합니다.
 *
 * @param element 기준이 되는 에디터 컨테이너 요소
 * @param offset 복구할 커서의 텍스트 오프셋 인덱스
 */
export const setCaretPosition = (element: HTMLElement, offset: number) => {
  let charIndex = 0;
  const range = document.createRange();

  range.setStart(element, 0);
  range.collapse(true);

  const nodeStack: Node[] = [element];
  let node: Node | undefined;
  let foundStart = false;
  let stop = false;

  while (!stop && (node = nodeStack.pop())) {
    if (node.nodeType === Node.TEXT_NODE) {
      const textNode = node as Text;
      const nextCharIndex = charIndex + textNode.length;

      if (!foundStart && offset >= charIndex && offset <= nextCharIndex) {
        range.setStart(textNode, offset - charIndex);
        range.setEnd(textNode, offset - charIndex);
        stop = true;
      }

      charIndex = nextCharIndex;
    } else {
      let i = node.childNodes.length;

      while (i--) {
        nodeStack.push(node.childNodes[i]);
      }
    }
  }

  const sel = window.getSelection();

  if (sel) {
    sel.removeAllRanges();
    sel.addRange(range);
  }
};
