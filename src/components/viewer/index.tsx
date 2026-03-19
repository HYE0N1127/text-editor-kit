import { State } from "../../types/editor/index";
import ContentViewer from "./content/index";

export type ViewerProps = {
  data: State;
};

const Viewer = ({ data }: ViewerProps) => {
  return <ContentViewer data={data} />;
};

export default Viewer;
