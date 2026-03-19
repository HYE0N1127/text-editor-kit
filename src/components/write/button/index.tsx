import { generateId } from "../../../utils/id";
import { useEditor } from "../../context/editor/hooks";
import { useFocusHandler } from "../../context/focus/hooks";

const EditorBlockCreator = () => {
  const { enter, getLastId } = useEditor();
  const { setFocusId } = useFocusHandler();

  const handleEnter = () => {
    const id = generateId();
    const prev = getLastId();

    setFocusId(id);
    enter({ next: id, prev: prev });
  };

  return <button className="bg-transparent w-full h-8" onClick={handleEnter} />;
};

export default EditorBlockCreator;
