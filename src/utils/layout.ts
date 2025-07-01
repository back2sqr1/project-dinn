import { Node, Edge } from '@xyflow/react';

export interface LayoutNode extends Node {
  data: {
    head?: {
      id: string;
      next?: any[];
    };
    [key: string]: any;
  };
}

interface NodePosition {
  x: number;
  y: number;
}

// Layout constants
const COLUMN_WIDTH = 200;      // Reduced column width
const VERTICAL_SPACING = 30;   // Reduced vertical spacing
const HORIZONTAL_SPACING = 40; // Much reduced horizontal spacing
const START_X = 50;            // Closer to left edge
const START_Y = 50;            // Closer to top

// Simple node height calculation
function getNodeHeight(node: LayoutNode): number {
  let baseHeight = 50; // Reduced minimum height for node content

  // if leaf node, base height is larger
  if (!node.data?.head?.next || node.data.head.next.length === 0) {
    baseHeight = 150; // Extra space for leaf nodes
  }

  const buttonsCount = node.data?.head?.next?.length || 0;
  const buttonHeight = 22; // Reduced height per button
  return baseHeight + (buttonsCount * buttonHeight);
}

// Main layout function - builds tree column by column
export function calculateTreeLayout(nodes: LayoutNode[], edges: Edge[]): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();
  
  // Step 1: Find root node (no incoming edges)
  const incomingEdges = new Set(edges.map(e => e.target));
  const rootNode = nodes.find(node => !incomingEdges.has(node.id));
  
  if (!rootNode) {
    // Fallback: position first node as root
    if (nodes.length > 0) {
      positions.set(nodes[0].id, { x: START_X, y: START_Y });
    }
    return positions;
  }

  // Step 2: Build parent-child relationships
  const children = new Map<string, string[]>();
  edges.forEach(edge => {
    if (!children.has(edge.source)) {
      children.set(edge.source, []);
    }
    children.get(edge.source)!.push(edge.target);
  });

  // Step 3: Organize nodes by depth (column)
  const nodesByDepth = new Map<number, string[]>();
  const nodeDepths = new Map<string, number>();

  function assignDepth(nodeId: string, depth: number) {
    nodeDepths.set(nodeId, depth);
    
    if (!nodesByDepth.has(depth)) {
      nodesByDepth.set(depth, []);
    }
    nodesByDepth.get(depth)!.push(nodeId);

    // Process children at next depth
    const nodeChildren = children.get(nodeId) || [];
    nodeChildren.forEach(childId => {
      assignDepth(childId, depth + 1);
    });
  }

  // Start from root
  assignDepth(rootNode.id, 0);

  // Step 4: Position nodes column by column
  const maxDepth = Math.max(...Array.from(nodeDepths.values()));
  
  // Build parent-child relationships and button indices for sorting
  const parentChildMap = new Map<string, string>();
  const buttonIndexMap = new Map<string, number>();
  
  edges.forEach(edge => {
    parentChildMap.set(edge.target, edge.source);
    // Extract button index from sourceHandle (e.g., "next-0" -> 0)
    if (edge.sourceHandle && edge.sourceHandle.startsWith('next-')) {
      const buttonIndex = parseInt(edge.sourceHandle.split('-')[1]) || 0;
      buttonIndexMap.set(edge.target, buttonIndex);
    }
  });
  
  for (let depth = 0; depth <= maxDepth; depth++) {
    const nodesInColumn = nodesByDepth.get(depth) || [];
    const columnX = START_X + (depth * (COLUMN_WIDTH + HORIZONTAL_SPACING));
    
    // Sort nodes in column according to the rules:
    // 1. If different parents: higher parent position = higher in column
    // 2. If same parent: lower button index = higher in column
    const sortedNodesInColumn = [...nodesInColumn].sort((nodeIdA, nodeIdB) => {
      const parentA = parentChildMap.get(nodeIdA);
      const parentB = parentChildMap.get(nodeIdB);
      
      // If different parents, sort by parent position (higher parent Y = lower in sort)
      if (parentA !== parentB) {
        const parentNodeA = nodes.find(n => n.id === parentA);
        const parentNodeB = nodes.find(n => n.id === parentB);
        
        if (parentNodeA && parentNodeB) {
          return parentNodeA.position.y - parentNodeB.position.y;
        }
      }
      
      // Same parent: sort by button index (lower index = higher in column)
      if (parentA === parentB) {
        const buttonIndexA = buttonIndexMap.get(nodeIdA) || 0;
        const buttonIndexB = buttonIndexMap.get(nodeIdB) || 0;
        return buttonIndexA - buttonIndexB;
      }
      
      // Fallback: maintain original order
      return nodesInColumn.indexOf(nodeIdA) - nodesInColumn.indexOf(nodeIdB);
    });
    
    let currentY = START_Y;
    
    sortedNodesInColumn.forEach(nodeId => {
      positions.set(nodeId, { x: columnX, y: currentY });
      
      // Move Y position down for next node
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        const nodeHeight = getNodeHeight(node);
        currentY += nodeHeight + VERTICAL_SPACING;
      }
    });
  }

  return positions;
}

// Function to position a new node when adding it
export function calculateOptimalNodePosition(
  parentNode: LayoutNode,
  allNodes: LayoutNode[],
  allEdges: Edge[]
): { x: number; y: number } {
  // New node goes in next column after parent
  const parentX = parentNode.position.x;
  const newX = parentX + COLUMN_WIDTH + HORIZONTAL_SPACING;
  
  // Find existing nodes in the target column
  const nodesInTargetColumn = allNodes.filter(node => 
    Math.abs(node.position.x - newX) < 50 // Allow some tolerance
  );
  
  // Position below the last node in that column
  let newY = START_Y;
  if (nodesInTargetColumn.length > 0) {
    // Find the bottom-most node
    const bottomNode = nodesInTargetColumn.reduce((bottom, current) => 
      current.position.y > bottom.position.y ? current : bottom
    );
    
    const bottomNodeHeight = getNodeHeight(bottomNode);
    newY = bottomNode.position.y + bottomNodeHeight + VERTICAL_SPACING;
  }
  
  return { x: newX, y: newY };
}

// Reorganize entire tree layout
export function reorganizeTreeLayout(nodes: LayoutNode[], edges: Edge[]): LayoutNode[] {
  const positions = calculateTreeLayout(nodes, edges);
  
  return nodes.map(node => ({
    ...node,
    position: positions.get(node.id) || node.position
  }));
}

