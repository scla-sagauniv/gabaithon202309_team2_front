import dagre from "dagre";
import { useState } from "react";
import ReactFlow, { Edge, Node, Position, useReactFlow } from "reactflow";

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
  const [id, setId] = useState<number>(0);
  const [selectedId, setSelectedNodeId] = useState<string | undefined>(
    undefined
  );
  const { setViewport } = useReactFlow();

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
    const [layoutedNodes, layoutedEdges] = getLayoutedElements(nodes, edges);
    setLayoutedNodes(layoutedNodes);
    setLayoutedEdges(layoutedEdges);
  };

  const onNodeClick = (e: React.MouseEvent, node: Node) => {
    console.log("selected");
    setSelectedNodeId(node.id);
    setViewport(
      { x: node.position.x, y: node.position.y, zoom: 1 },
      { duration: 800 }
    );
  };

  return (
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
        onNodeClick={onNodeClick}
      ></ReactFlow>
    </div>
  );
};

export default Graph;
