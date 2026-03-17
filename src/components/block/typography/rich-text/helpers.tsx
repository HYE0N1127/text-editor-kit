/**
 * 텍스트 내에서 특정 마크다운 패턴을 찾아내는 정규표현식입니다.
 * 괄호 () 안의 패턴들을 '|' 기호로 구분하여 매칭합니다.
 * 'g' 플래그를 사용하여 문자열 전체에서 일치하는 모든 부분을 찾습니다.
 * * 1. \*\*.*?\*\* : bold - **Text** (앞뒤로 **가 붙은 텍스트, 최소 매칭)
 * 2. __.*?__        : underline - __Text__ (앞뒤로 __가 붙은 텍스트, 최소 매칭)
 * 3. ~~.*?~~        : middle-line - ~~Text~~ (앞뒤로 ~~가 붙은 텍스트, 최소 매칭)
 * 4. _[^_]+_        : italic - _Text_ (밑줄 기호 '__'와 겹치지 않도록 내부에는 '_'가 없는 문자열만 매칭)
 * 5. \[.*?\]\(.*?\) : hyperlink - [Text](link) (대괄호와 소괄호 형태 매칭)
 */
const MARKDOWN_REGEX = /(\*\*.*?\*\*|__.*?__|~~.*?~~|_[^_]+_|\[.*?\]\(.*?\))/g;

export const renderFormattedText = (text: string) => {
  if (text == null) {
    return null;
  }

  const parts = text.split(MARKDOWN_REGEX);

  return parts.map((part, index) => {
    if (part == null) {
      return null;
    }

    // bold : **text**
    if (part.length >= 5 && part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={index} className="font-bold text-white">
          {part.slice(2, -2)}
        </span>
      );
    }

    // underline : __text__
    if (part.length >= 5 && part.startsWith("__") && part.endsWith("__")) {
      return (
        <span key={index} className="underline underline-offset-4 text-white">
          {part.slice(2, -2)}
        </span>
      );
    }

    // middle-line : ~~text~~
    if (part.length >= 5 && part.startsWith("~~") && part.endsWith("~~")) {
      return (
        <span key={index} className="line-through text-white">
          {part.slice(2, -2)}
        </span>
      );
    }

    // Italic : _text_
    if (part.length >= 3 && part.startsWith("_") && part.endsWith("_")) {
      return (
        <span key={index} className="italic text-white">
          {part.slice(1, -1)}
        </span>
      );
    }

    // Hyperlink
    const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
    if (linkMatch != null) {
      return (
        <a
          key={index}
          href={linkMatch[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 underline cursor-pointer hover:text-gray-300"
        >
          {linkMatch[1]}
        </a>
      );
    }

    // normal text
    return <span key={index}>{part}</span>;
  });
};
