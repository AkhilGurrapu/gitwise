'use client'

import React, { useMemo } from 'react';
import ReactFlow, {
  Controls,
  Background,
  Handle, // Import Handle for connection points (though not connecting yet)
  Position, // Import Position for Handle placement
  type Node,
  type Edge,
  // applyNodeChanges, // Not needed for read-only view initially
  // applyEdgeChanges, // Not needed for read-only view initially
  // type NodeChange, // Not needed for read-only view initially
  // type EdgeChange, // Not needed for read-only view initially
} from 'reactflow';

// Import React Flow CSS
import 'reactflow/dist/style.css';

// --- Custom Node Components ---

// Basic styling (can be moved to CSS modules later)
const nodeStyles = {
  common: {
    padding: '5px 10px',
    borderRadius: '3px',
    fontSize: '12px',
    border: '1px solid #555',
    background: '#f0f0f0',
    color: '#333',
  },
  branchLabel: {
    background: '#e1f5fe', // Light blue
    borderColor: '#0288d1',
  },
  headLabel: {
    background: '#fffde7', // Light yellow
    borderColor: '#fbc02d',
    fontWeight: 'bold',
  },
  commit: {
    background: '#e8f5e9', // Light green
    borderColor: '#388e3c',
    borderRadius: '50%', // Make commits circular
    minWidth: '40px',
    minHeight: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  }
};

// Branch/Tag Label Node
function BranchLabelNode({ data }: { data: { label: string } }) {
  return (
    <div style={{ ...nodeStyles.common, ...nodeStyles.branchLabel }}>
      {/* Add Handles if needed later for edges to connect visually */} 
      {/* <Handle type="target" position={Position.Left} /> */} 
      {data.label}
      {/* <Handle type="source" position={Position.Right} /> */} 
    </div>
  );
}

// HEAD Label Node
function HeadLabelNode({ data }: { data: { label: string } }) {
  return (
    <div style={{ ...nodeStyles.common, ...nodeStyles.headLabel }}>
      {/* <Handle type="target" position={Position.Left} /> */} 
      {data.label}
      {/* <Handle type="source" position={Position.Right} /> */} 
    </div>
  );
}

// Commit Node (Example - we don't have commit data yet)
// function CommitNode({ data }: { data: { label: string } }) { 
//   return (
//     <div style={{ ...nodeStyles.common, ...nodeStyles.commit }}>
//       {/* <Handle type="target" position={Position.Top} /> */} 
//       {data.label} {/* Show commit hash/message short */}
//       {/* <Handle type="source" position={Position.Bottom} /> */} 
//     </div>
//   );
// }

// Map node types to components
const nodeTypes = {
  branchLabel: BranchLabelNode, 
  headLabel: HeadLabelNode,
  // commit: CommitNode, // Uncomment when CommitNode is used
};

// --- Main Visualization Component ---

interface GitVisualizationProps {
  nodes: Node[]; // Use Node type from reactflow
  edges: Edge[]; // Use Edge type from reactflow
}

export default function GitVisualization({ nodes: initialNodes, edges: initialEdges }: GitVisualizationProps) {
  // Use useMemo to prevent unnecessary re-renders if props don't change deeply
  const nodes = useMemo(() => initialNodes, [initialNodes]);
  const edges = useMemo(() => initialEdges, [initialEdges]);

  // We don't need state for changes if it's just a static view initially
  // const [nodes, setNodes] = useState<Node[]>(initialNodes);
  // const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // const onNodesChange = useCallback(
  //   (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
  //   [setNodes]
  // );
  // const onEdgesChange = useCallback(
  //   (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
  //   [setEdges]
  // );

  return (
    // Set a fixed height for the ReactFlow container
    <div style={{ height: '100%', width: '100%', minHeight: '300px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes} // Register custom node types
        fitView // Automatically zoom/pan to fit the graph
        attributionPosition="bottom-right"
        // Prevent user interaction for static view
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnDoubleClick={false}
        nodesDraggable={false}
        nodesConnectable={false}
      >
        <Controls showInteractive={false} /> {/* Hide interactive controls */}
        <Background />
      </ReactFlow>
    </div>
  );
} 