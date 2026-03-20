import ContentEditor from "./content/index";
import { State } from "../../types/editor/index";
import { MarkdownEditorProvider } from "../context/editor/index";
import { FocusProvider } from "../context/focus/index";
import EditorBlockCreator from "./button/index";

export type EditorProps = {
  initialData?: State;
  onChange?: (data: State) => void;
};

/**
 * Markdown 형식을 지원하는 Editor 컴포넌트를 반환합니다.
 *
 * @param Props.initialData - Editor의 초기 데이터(default: undefined)
 * @param Props.onChange - Editor 내부 데이터가 바뀔 때 마다 실행 될 함수
 */
const Editor = ({ initialData, onChange }: EditorProps) => {
  return (
    <div className="w-full">
      <FocusProvider>
        <MarkdownEditorProvider initial={initialData} onChange={onChange}>
          <ContentEditor />
          <EditorBlockCreator />
        </MarkdownEditorProvider>
      </FocusProvider>
    </div>
  );
};

export default Editor;
