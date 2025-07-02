import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNodesState, useEdgesState } from '@xyflow/react';
import { Node, Edge } from '@xyflow/react';
import { TimeStepNode } from '@/utils/TimeStepNode';
import { createRobotMap } from '@/utils/RobotManager';
import { reorganizeTreeLayout, LayoutNode } from '@/utils/layout';
import { determine_cost, determine_min_time, getColor, highlightCost, highlightTime } from '@/utils/cost_and_time';
import { HighlightMode } from '@/components/Legend';
import search from '@/utils/search';
import { nanoid } from 'nanoid';

interface UseReactFlowTreeProps {
  parsedData: any;
  robots: any[];
  allowWaiting: boolean;
  onNodeSelect: (robotMap: Map<string, any>) => void;
  clearSelection: () => void;
}

export function useReactFlowTree({
  parsedData,
  robots,
  allowWaiting,
  onNodeSelect,
  clearSelection
}: UseReactFlowTreeProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [highlightMode, setHighlightMode] = useState<HighlightMode>('none');

  // Memoized search results
  const searchResults = useMemo((): TimeStepNode | null =>
    search(parsedData, createRobotMap(robots), allowWaiting),
    [parsedData, robots, allowWaiting]
  );

  // Initialize tree when search results change
  useEffect(() => {
    if (searchResults && nodes.length === 0) {
      const newNodes = [{
        id: searchResults.id,
        type: 'xyTimeStepNode',
        data: {
          head: searchResults,
          edges: {
            position: [0, 0],
            handle_id: nanoid(),
          },
          onNodeSelect,
          highlightMode,
        },
        position: { x: 150, y: 100 },
      }];
      setNodes(newNodes);

      // Set cost and time highlighting
      const cost = determine_cost(searchResults);
      highlightCost(searchResults, cost);

      const time = determine_min_time(searchResults);
      highlightTime(searchResults, time);
    }
  }, [searchResults, onNodeSelect, highlightMode, nodes.length, setNodes]);

  // Update highlighting when mode changes
  useEffect(() => {
    // Use a functional update to avoid dependency issues
    setNodes(currentNodes => {
      if (currentNodes.length === 0) return currentNodes;
      
      return currentNodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          highlightMode: highlightMode
        }
      }));
    });
    
    setEdges(currentEdges => {
      if (currentEdges.length === 0) return currentEdges;
      
      return currentEdges.map(edge => ({
        ...edge,
        style: { 
          stroke: edge.data?.highlightColor && Array.isArray(edge.data.highlightColor) 
            ? getColor(edge.data.highlightColor, highlightMode) 
            : edge.style?.stroke 
        }
      }));
    });
  }, [highlightMode, setNodes, setEdges]); // Only depend on highlightMode and the setters

  const handleHighlightModeChange = useCallback((mode: HighlightMode) => {
    setHighlightMode(mode);
  }, []);

  const handleReorganizeLayout = useCallback(() => {
    const currentNodes = nodes as LayoutNode[];
    const reorganizedNodes = reorganizeTreeLayout(currentNodes, edges);
    setNodes(reorganizedNodes as Node[]);
  }, [nodes, edges, setNodes]);

  const handleClearTree = useCallback(() => {
    setNodes([]);
    setEdges([]);
    clearSelection();
  }, [setNodes, setEdges, clearSelection]);

  return {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    highlightMode,
    handleHighlightModeChange,
    handleReorganizeLayout,
    handleClearTree
  };
}
