import { BlockType, RichText } from "../../../types/editor/index";

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

export const parseInlineMarkdown = (richTexts: RichText[]): RichText[] => {
  const regex = /(\*\*.*?\*\*|\*.*?\*|~~.*?~~|__.*?__)/g;

  return richTexts.flatMap((richText) => {
    const parts = richText.text.split(regex);
    return parts
      .filter((part) => part !== "")
      .map((part) => {
        let textContent = part;
        let matchedType:
          | "bold"
          | "italic"
          | "strikethrough"
          | "underline"
          | null = null;

        switch (true) {
          case part.startsWith("**") && part.endsWith("**") && part.length > 4:
            matchedType = "bold";
            textContent = part.slice(2, -2);
            break;
          case part.startsWith("__") && part.endsWith("__") && part.length > 4:
            matchedType = "underline";
            textContent = part.slice(2, -2);
            break;
          case part.startsWith("~~") && part.endsWith("~~") && part.length > 4:
            matchedType = "strikethrough";
            textContent = part.slice(2, -2);
            break;
          case part.startsWith("*") && part.endsWith("*") && part.length > 2:
            matchedType = "italic";
            textContent = part.slice(1, -1);
            break;
        }

        return {
          text: textContent,
          annotations: {
            bold: matchedType === "bold" ? true : richText.annotations.bold,
            italic:
              matchedType === "italic" ? true : richText.annotations.italic,
            strikethrough:
              matchedType === "strikethrough"
                ? true
                : richText.annotations.strikethrough,
            underline:
              matchedType === "underline"
                ? true
                : richText.annotations.underline,
          },
        };
      });
  });
};

export const parseDOMToRichText = (element: HTMLElement): RichText[] => {
  const richTexts: RichText[] = [];

  const walk = (node: Node, currentAnnotations: any) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.textContent) {
        richTexts.push({
          text: node.textContent,
          annotations: { ...currentAnnotations },
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      const newAnnotations = { ...currentAnnotations };

      if (
        el.classList.contains("font-bold") ||
        el.tagName === "B" ||
        el.tagName === "STRONG"
      )
        newAnnotations.bold = true;
      if (
        el.classList.contains("italic") ||
        el.tagName === "I" ||
        el.tagName === "EM"
      )
        newAnnotations.italic = true;
      if (
        el.classList.contains("line-through") ||
        el.tagName === "STRIKE" ||
        el.tagName === "S"
      )
        newAnnotations.strikethrough = true;
      if (el.classList.contains("underline") || el.tagName === "U")
        newAnnotations.underline = true;

      el.childNodes.forEach((child) => walk(child, newAnnotations));
    }
  };

  element.childNodes.forEach((child) =>
    walk(child, {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
    }),
  );

  // 동일한 스타일의 텍스트가 분리되어 있다면 하나로 예쁘게 합쳐줍니다.
  const merged: RichText[] = [];
  for (const rt of richTexts) {
    const last = merged[merged.length - 1];
    if (
      last &&
      JSON.stringify(last.annotations) === JSON.stringify(rt.annotations)
    ) {
      last.text += rt.text;
    } else {
      merged.push(rt);
    }
  }
  return merged;
};

export const richTextToHTML = (richTexts: RichText[]) => {
  if (!richTexts || richTexts.length === 0) return "";
  return richTexts
    .map((rt) => {
      const classes = [];
      if (rt.annotations.bold) classes.push("font-bold");
      if (rt.annotations.italic) classes.push("italic");
      if (rt.annotations.underline) classes.push("underline");
      if (rt.annotations.strikethrough) classes.push("line-through");

      const safeText = rt.text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      if (classes.length === 0) return safeText;
      return `<span class="${classes.join(" ")}">${safeText}</span>`;
    })
    .join("");
};

export const getCaretCharacterOffsetWithin = (element: HTMLElement) => {
  let caretOffset = 0;

  // 구형 IE 호환성 코드를 제거하고 모던 표준 API만 사용합니다.
  const doc = element.ownerDocument;
  if (!doc) return caretOffset;

  const win = doc.defaultView;
  if (!win) return caretOffset;

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

export const setCaretPosition = (element: HTMLElement, offset: number) => {
  let charIndex = 0;
  const range = document.createRange();
  range.setStart(element, 0);
  range.collapse(true);

  // 명시적으로 Node 배열 타입을 지정하여 타입스크립트 에러를 방지합니다.
  const nodeStack: Node[] = [element];
  let node: Node | undefined;
  let foundStart = false;
  let stop = false;
  let lastNode: Node | null = null;

  while (!stop && (node = nodeStack.pop())) {
    if (node.nodeType === Node.TEXT_NODE) {
      lastNode = node;
      const nextCharIndex = charIndex + (node.nodeValue?.length || 0);

      if (!foundStart && offset >= charIndex && offset <= nextCharIndex) {
        range.setStart(node, offset - charIndex);
        foundStart = true;
      }
      if (foundStart && offset >= charIndex && offset <= nextCharIndex) {
        range.setEnd(node, offset - charIndex);
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

  // 만약 마크다운 변환 등으로 텍스트 길이가 짧아져서 지정한 offset을 초과한 경우, 가장 마지막 노드의 끝에 포커싱
  if (!foundStart && lastNode) {
    range.setStart(lastNode, lastNode.nodeValue?.length || 0);
    range.collapse(true);
  }

  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
};
