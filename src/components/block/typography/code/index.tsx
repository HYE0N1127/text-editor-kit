import { PropsWithChildren } from "react";
import { CodeBlock } from "../../../../types/editor/index";

import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-cshtml";
import "prismjs/themes/prism-okaidia.css";

type Props = {
  block: CodeBlock;
} & PropsWithChildren;

const Code = ({ children }: Props) => {
  return (
    <div className="relative my-2 rounded-md w-full group transition-all duration-200 border border-[#333333] bg-[#202020]">
      <div className="[&_pre]:!bg-transparent [&_code]:!bg-transparent">
        {children}
      </div>
    </div>
  );
};

export default Code;
