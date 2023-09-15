import dagre from "dagre";
import { useState } from "react";
import ReactFlow, { Edge, Node, Position, useReactFlow } from "reactflow";

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
  const [nodeId, setNodeId] = useState<number>(0);
  const [edgeId, setEdgeId] = useState<number>(0);
  const [selectedId, setSelectedNodeId] = useState<string | undefined>(
    undefined
  );
  const { setCenter } = useReactFlow();

  const [word, setWord] = useState("");
  const [words, setWords] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [attribute, setAttribute] = useState("");
  const [plusWord, setPlusWord] = useState("");
  const [minusWord, setMinusWord] = useState("");

  const focusNode = (node: Node) => {
    console.log(`focus: ${node.id}`);

    setSelectedNodeId(node.id);
    setCenter(
      node.position.x + node.width! / 2,
      node.position.y + node.height! / 2,
      { duration: 500, zoom: 3 }
    );
  };

  const addNodes = (labels: string[]): Node[] => {
    console.log("add node");
    let nextId = nodeId;
    const newNodes: Node[] = [];
    for (const label of labels) {
      newNodes.push({
        id: nextId.toString(),
        position: { x: 0, y: 0 },
        data: { label: `${nextId}${label}` },
        selected: false,
      });
      nextId = nextId + 1;
    }
    const afterNodes = [...nodes, ...newNodes];
    setNodes(afterNodes);
    setNodeId(nextId);
    return afterNodes;
  };

  type AddEdgeParam = {
    source: string;
    target: string;
  };
  const addEdges = (params: AddEdgeParam[]): Edge[] => {
    console.log("add edge");
    let nextId = edgeId;
    const newEdges: Edge[] = [];
    for (const param of params) {
      newEdges.push({
        id: nextId.toString(),
        source: param.source,
        target: param.target,
        animated: true,
      });
      nextId = nextId + 1;
    }
    const afterEdges = [...edges, ...newEdges];
    setEdges(afterEdges);
    setEdgeId(nextId);
    return afterEdges;
  };

  type AddElementParam = {
    label: string;
    source: string;
    target: string;
  };
  const addElemetnts = (params: AddElementParam[]): [Node[], Edge[]] => {
    console.log("add element");
    const labels: string[] = [];
    const edgeParams: AddEdgeParam[] = [];
    for (let i = 0; i < params.length; i++) {
      labels.push(params[i].label);
      edgeParams.push({
        source: params[i].source,
        target: params[i].target,
      });
    }
    const newNodes = addNodes(labels);
    const newEdges = addEdges(edgeParams);
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

  const onInit = () => {
    addNodes([input]);
    subimt(input, (0).toString());
  };

  const onChoice = (choiced: boolean) => {
    subimt(choiced ? plusWord : minusWord, selectedId!.toString());
  };

  const subimt = (word: string, selectedId: string) => {
    const params: AddElementParam[] = [];
    const attrRes = getAttribute(word);
    const nextRes = getNextWord(word, attrRes.attribute);
    setMinusWord(nextRes.minus.word);
    setPlusWord(nextRes.plus.word);
    params.push({
      label: nextRes.minus.word,
      source: selectedId,
      target: (nodeId + 1).toString(),
    });
    params.push({
      label: nextRes.plus.word,
      source: selectedId,
      target: (nodeId + 2).toString(),
    });
    const [newNodes, newEdges] = addElemetnts(params);
    console.log(newNodes);
    updateGraph(newNodes, newEdges);
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
    <div style={{ width: "100vw", height: "100vh" }}>
      <div style={{ display: "block", marginBottom: 15 }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button onClick={onInit} style={{ borderColor: "white" }}>
          init
        </button>
      </div>
      <button
        onClick={() => (selectedId ? onChoice(false) : undefined)}
        style={{ borderColor: "white" }}
      >
        minus
      </button>
      <a>{attribute}</a>
      <button
        onClick={() => (selectedId ? onChoice(true) : undefined)}
        style={{ borderColor: "white", marginBottom: 15 }}
      >
        plus
      </button>
      <ReactFlow
        nodes={layoutedNodes}
        edges={layoutedEdges}
        onNodeClick={onNodeClick}
      ></ReactFlow>
    </div>
  );
};

export default Graph;
