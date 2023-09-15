import "reactflow/dist/style.css";
import { ReactFlowProvider } from "reactflow";
import Graph from "./components/graph";

function App() {
  return (
    <>
      <ReactFlowProvider>
        <Graph />
      </ReactFlowProvider>
    </>
  );
}

export default App;
