import "./App.css";
import senbeiImage from "./assets/senbei.png";
import demoImage from "./assets/demo.png";

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
        <h1>しかしかパラダイス!!!</h1>
        <img src={senbeiImage} id="senbei" />
        <div id="container">
          <img src={demoImage} alt="" id="dear" />
          <div style={{ display: "flex" }}>
            <div style={{ display: "block" }}>
              <button id="minusbutton">たべない！</button>
              <p>minusWord</p>
            </div>
            <p>attribute</p>
            <div style={{ display: "block" }}>
              <button id="plusbutton">たべる！</button>
              <p>plusWord</p>
            </div>
          </div>
          <p>word</p>
          <input
            id="firstword"
            type="text"
            // value={input}
            // onChange={(e) => setInput(e.target.value)}
          />
          <button id="submitbutton">あげる</button>
        </div>
      </body>
    </>
  );
}

export default App;
