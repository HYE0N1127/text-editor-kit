import { useEditor, useRootIds } from "../../context/editor/hooks";
import {
  DragAndDropProvider,
  DropZone,
} from "../../drag-drop/block/drop/index";
import EditorBlock from "./item/index";

const ContentEditor = () => {
  const rootIds = useRootIds();
  const { moveTo } = useEditor();

  return (
    <DragAndDropProvider>
      <DropZone onDrop={moveTo}>
        <div className="flex flex-col gap-1 pb-[12px]">
          {rootIds.map((id) => (
            <EditorBlock key={id} id={id} />
          ))}
        </div>
      </DropZone>
    </DragAndDropProvider>
  );
};

export default ContentEditor;
