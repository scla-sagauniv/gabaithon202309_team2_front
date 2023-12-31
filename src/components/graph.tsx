import dagre from "dagre";
import { useState } from "react";
import ReactFlow, { Edge, Node, Position, useReactFlow } from "reactflow";
import CustomNode from "./CustomNode";
import senbeiImage from "../assets/senbei.png";
import demoImage from "../assets/demo.png";

import "./graph.css";

const nodeTypes = {
  custom: CustomNode,
};

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

const Graph = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [layoutedNodes, setLayoutedNodes] = useState<Node[]>([]);
  const [layoutedEdges, setLayoutedEdges] = useState<Edge[]>([]);
  const [nodeId, setNodeId] = useState<number>(-1);
  const [edgeId, setEdgeId] = useState<number>(0);
  const [selectedId, setSelectedNodeId] = useState<string | undefined>(
    undefined
  );
  const { setCenter, fitView } = useReactFlow();

  const [input, setInput] = useState("");
  const [attribute, setAttribute] = useState("");
  const [plusWord, setPlusWord] = useState("");
  const [minusWord, setMinusWord] = useState("");

  const fit = () => {
    fitView();
  };

  const focusNode = (node: Node) => {
    console.log(`focus: ${node.id}`);

    setSelectedNodeId(node.id);
    setCenter(
      node.position.x + node.width! / 2,
      node.position.y + node.height! / 2,
      { duration: 500, zoom: 1.8 }
    );
  };

  const addNodes = (labels: string[], isRoot: boolean = false): Node[] => {
    console.log("add node");
    let nextId = nodeId;
    const newNodes: Node[] = [];
    for (const label of labels) {
      nextId = nextId + 1;
      newNodes.push({
        id: nextId.toString(),
        type: isRoot ? "custom" : undefined,
        position: { x: 0, y: 0 },
        data: { label: `${label}` },
        selected: false,
      });
      isRoot = false;
    }
    const afterNodes = [...nodes, ...newNodes];
    setNodes(afterNodes);
    setNodeId(nextId);
    return afterNodes;
  };

  type AddEdgeParam = {
    source: string;
    target: string;
    choice: boolean;
  };
  const addEdges = (params: AddEdgeParam[]): Edge[] => {
    console.log("add edge");
    let nextId = edgeId;
    const newEdges: Edge[] = [];
    for (const param of params) {
      const choiceStr = param.choice ? "食べる" : "食べない";
      nextId = nextId + 1;
      newEdges.push({
        id: nextId.toString(),
        source: param.source,
        target: param.target,
        animated: false,
        zIndex: 1,
        style: {
          strokeWidth: 15,
          stroke: "#6a3906",
        },
        label: choiceStr,
      });
    }
    const afterEdges = [...edges, ...newEdges];
    setEdges(afterEdges);
    setEdgeId(nextId);
    return afterEdges;
  };

  type AddElementParam = {
    labels: string[];
    edgeParams: AddEdgeParam[];
  };
  const addElemetnts = (
    param: AddElementParam,
    isRoot: boolean = false
  ): [Node[], Edge[]] => {
    console.log("add element");
    const newNodes = addNodes(param.labels, isRoot);
    const newEdges = addEdges(param.edgeParams);
    return [newNodes, newEdges];
  };

  const updateGraph = (nodes: Node[], edges: Edge[]) => {
    const [layoutedNodes, layoutedEdges] = getLayoutedElements(nodes, edges);
    setLayoutedNodes(layoutedNodes);
    setLayoutedEdges(layoutedEdges);
  };

  const onNodeClick = (_: React.MouseEvent, node: Node) => {
    focusNode(node);
  };

  const onEdgeClick = (_: React.MouseEvent, edge: Edge) => {
    const targetNode = nodes.filter((node) => node.id === edge.target)[0];
    // focusNode(targetNode);
    setSelectedNodeId(targetNode.id);
    if (edge.label === "食べる") {
      onChoice(true);
    } else {
      onChoice(false);
    }
  };

  const onInit = () => {
    subimt(input, (0).toString(), true);
  };

  const onChoice = (choiced: boolean) => {
    setSelectedNodeId((prev) => {
      subimt(choiced ? plusWord : minusWord, prev!.toString());
      return prev;
    });
  };

  const subimt = async (
    word: string,
    selectedId: string,
    isInit: boolean = false
  ) => {
    const param: AddElementParam = {
      labels: [],
      edgeParams: [],
    };
    let targetBaseId = nodeId;
    if (isInit) {
      param.labels.push(word);
      targetBaseId += 1;
    }
    const attrRes = await getAttribute(word);
    setAttribute(attrRes.attribute);
    const nextRes = await getNextWord(word, attrRes.attribute);
    setMinusWord(nextRes.minus.word);
    setPlusWord(nextRes.plus.word);
    param.labels.push(nextRes.minus.word);
    param.edgeParams.push({
      source: selectedId,
      target: (targetBaseId + 1).toString(),
      choice: false,
    });
    param.labels.push(nextRes.plus.word);
    param.edgeParams.push({
      source: selectedId,
      target: (targetBaseId + 2).toString(),
      choice: true,
    });
    const [newNodes, newEdges] = addElemetnts(param, isInit);
    console.log(newEdges);
    setNodeId((prev) => {
      console.log(prev);
      return prev;
    });
    updateGraph(newNodes, newEdges);
  };

  const getNextWord = async (
    word: string,
    attribute: string
  ): Promise<NextWord> => {
    console.log("getNextWord");
    let pWord = "";
    let nWord = "";
    const data = {
      word: word,
      attribute: attribute,
      choiced: true,
    };
    let res = await fetch(`${import.meta.env.VITE_BASE_URL}/choiced`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (res.status == 200) {
      const json = await res.json();
      console.log(json);
      pWord = json.word;
    } else {
      console.log(res.body);
    }
    data.choiced = false;
    res = await fetch(`${import.meta.env.VITE_BASE_URL}/choiced`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (res.status == 200) {
      const json = await res.json();
      console.log(json);
      nWord = json.word;
    } else {
      console.log(res.body);
    }
    const result: NextWord = {
      plus: {
        word: pWord,
      },
      minus: {
        word: nWord,
      },
    };
    return result;
  };

  const getAttribute = async (word: string): Promise<AttributeRes> => {
    console.log(`getAttribute: ${word}`);
    const result: AttributeRes = {
      attribute: "",
    };
    const data = {
      word: word,
    };
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/word`, {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (res.status == 200) {
      const json = await res.json();
      console.log(json);
      result.attribute = json.attribute;
    } else {
      console.log(res.body);
    }
    return result;
  };
  return (
    <div>
      <body id="body">
        <h1>しかしかパラダイス!!!</h1>
        {nodes.length !== 0 ? <img src={senbeiImage} id="senbei" /> : undefined}
        <div id="container">
          <div style={{ width: "100vw", height: "100vh" }}>
            <ReactFlow
              nodes={layoutedNodes}
              edges={layoutedEdges}
              onNodeClick={onNodeClick}
              onEdgeClick={onEdgeClick}
              nodeTypes={nodeTypes}
            ></ReactFlow>
          </div>
          {nodes.length === 0 ? (
            <img src={demoImage} alt="" id="dear" />
          ) : undefined}
          <input
            id="firstword"
            type="text"
            value={nodes.length === 0 ? input : attribute}
            onChange={(e) => setInput(e.target.value)}
          />
          {nodes.length === 0 ? (
            <button id="submitbutton" onClick={onInit}>
              {" "}
              名前をつける ƒ
            </button>
          ) : (
            <button id="submitbutton" onClick={fit}>
              {" "}
              全体
            </button>
          )}
        </div>
      </body>
    </div>
  );
};

export default Graph;
