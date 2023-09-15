import { Handle, NodeProps, Position } from "reactflow";
import demoImage from "../assets/demo.png";

export default function CustomNode({ data }: NodeProps) {
  return (
    <div className="customNode">
      <div
        style={{
          // backgroundImage: `url(${demoImage})`,
          backgroundColor: "white",
          color: "black",
          borderColor: "black",
          width: 100,
          height: 100,
          borderRadius: 50,
        }}
      >
        <img
          src={demoImage}
          alt=""
          style={{
            maxWidth: "300%",
            height: "auto",
            // display: "block",
            position: "absolute",
            top: "-50%",
            // top: 0,
            left: "-100%",
            right: 0,
            bottom: 0,
            margin: "auto",
          }}
        />
        <Handle className="port" position={Position.Top} type="source" />
        <p
          style={{
            fontSize: "18px",
            fontWeight: "bold",
            position: "absolute",
            top: 0,
            // top: 0,
            left: "25%",
            right: 0,
            bottom: 0,
            margin: "auto",
          }}
        >
          {data.label}
        </p>
      </div>
    </div>
  );
}
