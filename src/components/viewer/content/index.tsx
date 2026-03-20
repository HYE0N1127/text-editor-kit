import { State } from "../../../types/editor/index";
import ViewerBlock from "../item/index";

export type Props = {
  data?: State;
};

const ContentViewer = ({ data }: Props) => {
  return (
    <div className="flex flex-col gap-1 pb-[12px]">
      {data?.rootIds?.map((id) => (
        <ViewerBlock key={id} id={id} nodes={data.nodes} />
      ))}
    </div>
  );
};

export default ContentViewer;
