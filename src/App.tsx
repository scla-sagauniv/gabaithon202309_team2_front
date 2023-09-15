import "./App.css";

import demoImage from "./assets/demo.png";
import Senbei from "./components/senbei/senbei";

import "reactflow/dist/style.css";
import { ReactFlowProvider } from "reactflow";
import Graph from "./components/graph";

function App() {
  return (
    <>
      <ReactFlowProvider>
        <Graph />
      </ReactFlowProvider>
      <body id="body">
        <Senbei />
      </body>
      <div>
        <img src={demoImage} alt="" />
      </div>
    </>
  );
}

export default App;
