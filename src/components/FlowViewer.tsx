import React from 'react';
import { ReactFlow, Controls, Background, BackgroundVariant } from '@xyflow/react';
import { Node, Edge } from '@xyflow/react';
import XYTimeStepNode from '@/components/XYTimeStepNode';
import CustomSmoothStepEdge from '@/components/CustomSmoothStepEdge';
import Legend, { HighlightMode } from '@/components/Legend';

interface FlowViewerProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  highlightMode: HighlightMode;
  onHighlightModeChange: (mode: HighlightMode) => void;
  onReorganizeLayout: () => void;
  onClearTree: () => void;
  allowWaiting: boolean;
  onAllowWaitingChange: (allow: boolean) => void;
}

const nodeTypes = { xyTimeStepNode: XYTimeStepNode };
const edgeTypes = { customSmoothStep: CustomSmoothStepEdge };

export default function FlowViewer({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  highlightMode,
  onHighlightModeChange,
  onReorganizeLayout,
  onClearTree,
  allowWaiting,
  onAllowWaitingChange
}: FlowViewerProps) {
  return (
    <ReactFlow
      defaultEdgeOptions={{ animated: true }}
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      proOptions={{ hideAttribution: true }}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
    >
      <Controls />
      <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      <Legend 
        onHighlightModeChange={onHighlightModeChange}
        currentMode={highlightMode}
        onReorganizeLayout={onReorganizeLayout}
        onClearTree={onClearTree}
        allowWaiting={allowWaiting}
        onAllowWaitingChange={onAllowWaitingChange}
      />
    </ReactFlow>
  );
}
