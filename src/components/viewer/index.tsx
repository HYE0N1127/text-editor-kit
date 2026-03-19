import { useRootIds } from "../context/editor/hooks";
import ViewerBlock from "./item/index";

const Viewer = () => {
  const rootIds = useRootIds();

  return (
    <div className="flex flex-col gap-1 pb-[12px]">
      {rootIds.map((id) => (
        <ViewerBlock key={id} id={id} />
      ))}
    </div>
  );
};

export default Viewer;
