import { useCallback, useState } from "react";
import "./App.css";

import demoImage from "./assets/demo.png";
import Senbei from "./components/senbei/senbei";

import ReactFlow, {
  Node,
  Edge,
  Position,
  OnSelectionChangeParams,
} from "reactflow";
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
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [layoutedNodes, setLayoutedNodes] = useState<Node[]>([]);
  const [layoutedEdges, setLayoutedEdges] = useState<Edge[]>([]);
  const [id, setId] = useState<number>(0);
  const [selectedId, setSelectedNodeId] = useState<string | undefined>(
    undefined
  );

  const addNode = (label: string): Node[] => {
    console.log("add node");
    const newNode: Node = {
      id: id.toString(),
      position: { x: 0, y: 0 },
      data: { label: `${id}${label}` },
      selected: false,
    };
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    const nextId = id + 1;
    setId(nextId);
    return newNodes;
  };

  const addEdge = (source: string, target: string): Edge[] => {
    console.log("add edge");
    const newEdge: Edge = {
      id: id.toString(),
      source: source,
      target: target,
      animated: true,
    };
    const newEdges = [...edges, newEdge];
    setEdges(newEdges);
    setId((prev) => prev + 1);
    return newEdges;
  };

  const addElemetnt = (label: string, source: string) => {
    console.log("add element");
    const newNodes = addNode(label);
    const newEdges = addEdge(
      source,
      newNodes[newNodes.length - 1].id.toString()
    );
    updateGraph(newNodes, newEdges);
  };

  const updateGraph = (nodes: Node[], edges: Edge[]) => {
    console.log(edges);
    const [layoutedNodes, layoutedEdges] = getLayoutedElements(nodes, edges);
    setLayoutedNodes(layoutedNodes);
    setLayoutedEdges(layoutedEdges);
  };

  const onSelectionChange = useCallback((params: OnSelectionChangeParams) => {
    const selectedNodes = params.nodes.filter((node) => node.selected);
    console.log(selectedNodes);
    if (selectedNodes.length === 0) setSelectedNodeId(undefined);
    if (selectedNodes.length === 1) setSelectedNodeId(selectedNodes[0].id);
  }, []);

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
        <button
          onClick={() => {
            const newNodes = addNode("init");
            updateGraph(newNodes, edges);
          }}
        >
          init
        </button>
        <button
          onClick={() =>
            selectedId ? addElemetnt("", selectedId.toString()) : undefined
          }
        >
          add
        </button>
        <ReactFlow
          nodes={layoutedNodes}
          edges={layoutedEdges}
          onSelectionChange={onSelectionChange}
        ></ReactFlow>
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
