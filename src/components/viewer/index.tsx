import { State } from "../../types/editor/index";
import ContentViewer from "./content/index";

export type Props = {
  data: State;
};

const Viewer = ({ data }: Props) => {
  return <ContentViewer data={data} />;
};

export default Viewer;
