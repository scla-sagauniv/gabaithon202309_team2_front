import { useState } from "react";
import "./App.css";

import demoImage from "./assets/demo.png";
import Senbei from "./components/senbei/senbei";

import ReactFlow, { Node, Edge, Position } from "reactflow";
import dagre from "dagre";

import "reactflow/dist/style.css";

type AttributeRes = {
  attribute: string;
};

type ChoisedRes = {
  word: string;
};

type NextWord = {
  plus: ChoisedRes;
  minus: ChoisedRes;
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  direction = "BT"
): [Node[], Edge[]] => {
  const isHorizontal = direction === "LR";
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((el) => {
    dagreGraph.setNode(el.id, { width: nodeWidth, height: nodeHeight });
  });
  edges.forEach((el) => {
    dagreGraph.setEdge(el.source, el.target);
  });

  dagre.layout(dagreGraph);

  return [
    nodes.map((el) => {
      const nodeWithPosition = dagreGraph.node(el.id);
      el.targetPosition = isHorizontal ? Position.Left : Position.Bottom;
      el.sourcePosition = isHorizontal ? Position.Right : Position.Top;

      // unfortunately we need this little hack to pass a slightly different position
      // to notify react flow about the change. Moreover we are shifting the dagre node position
      // (anchor=center center) to the top left so it matches the react flow node anchor point (top left).
      el.position = {
        x: nodeWithPosition.x - nodeWidth / 2 + Math.random() / 1000,
        y: nodeWithPosition.y - nodeHeight / 2,
      };

      return el;
    }),
    edges,
  ];
};

function App() {
  const initialNodes: Node[] = [
    {
      id: "1",
      position: { x: 5750, y: 250 },
      data: { label: "1" },
    },
    {
      id: "2",
      position: { x: 5750, y: 250 },
      data: { label: "2" },
    },
    {
      id: "3",
      position: { x: 5750, y: 250 },
      data: { label: "3" },
    },
    {
      id: "4",
      position: { x: 5750, y: 250 },
      data: { label: "4" },
    },
    {
      id: "5",
      position: { x: 5750, y: 250 },
      data: { label: "5" },
    },
  ];
  const initialEdges: Edge[] = [
    {
      id: "6",
      source: "1",
      target: "2",
      animated: true,
    },
    {
      id: "7",
      source: "1",
      target: "3",
      animated: true,
    },
    {
      id: "8",
      source: "1",
      target: "4",
      animated: true,
    },
    {
      id: "9",
      source: "4",
      target: "5",
      animated: true,
    },
  ];
  const [layoutedNodes, layoutedEdges] = getLayoutedElements(
    initialNodes,
    initialEdges
  );

  // const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  // const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // const onConnect = useCallback(
  //   (params) => setEdges((eds) => addEdge(params, eds)),
  //   [setEdges]
  // );

  const [word, setWord] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [attribute, setAttribute] = useState("");
  const [plusWord, setPlusWord] = useState("");
  const [minusWord, setMinusWord] = useState("");

  const onPlus = () => {
    console.log("plus");
    subimt(plusWord);
  };

  const onMinus = () => {
    console.log("minus");
    subimt(minusWord);
  };

  const onInit = () => {
    console.log("init");
    subimt(input);
  };

  const subimt = (word: string) => {
    setWord(word);
    setWords((prev: string[]) => {
      return [...prev, word];
    });
    const attrRes = getAttribute(word);
    setAttribute(attrRes.attribute);
    const nextRes = getNextWord(word, attrRes.attribute);
    setPlusWord(nextRes.plus.word);
    setMinusWord(nextRes.minus.word);
  };

  const getNextWord = (word: string, attribute: string): NextWord => {
    console.log("getNextWord");
    const res: NextWord = {
      plus: {
        word: `${word}+${attribute}`,
      },
      minus: {
        word: `${word}-${attribute}`,
      },
    };
    return res;
  };

  const getAttribute = (word: string): AttributeRes => {
    console.log(`getAttribute: ${word}`);
    const res: AttributeRes = {
      attribute: `attr${words.length}`,
    };
    return res;
  };
  return (
    <>
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow nodes={layoutedNodes} edges={layoutedEdges}></ReactFlow>
      </div>
      <body id="body">
        <Senbei />
      </body>
      <div>
        <img src={demoImage} alt="" />
        <div style={{ display: "flex" }}>
          <div style={{ display: "block" }}>
            <button style={{ borderColor: "white" }} onClick={onMinus}>
              minus
            </button>
            <p>{minusWord}</p>
          </div>
          <p>{attribute}</p>
          <div style={{ display: "block" }}>
            <button style={{ borderColor: "white" }} onClick={onPlus}>
              plus
            </button>
            <p>{plusWord}</p>
          </div>
        </div>
        <p>{word}</p>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={onInit}>submit</button>
      </div>
    </>
  );
}

export default App;
