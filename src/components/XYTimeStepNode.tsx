import React, { memo, useCallback, useState } from 'react';
import { TimeStepNode } from '@/utils/TimeStepNode';
import { Robot } from '@/utils/Robot';
import { nanoid } from 'nanoid';
import { Handle, Position, useReactFlow } from '@xyflow/react';
import { getColor } from '@/utils/cost_and_time';
import { calculateOptimalNodePosition, LayoutNode } from '@/utils/layout';
import { getSelectedStyle } from '@/utils/nodeFormatters';

import { 
    EmptyNode, 
    NodeHeader, 
    LeafNodeContent, 
    NonLeafNodeContent, 
    NextNodeButton 
} from '@/components/NodeComponents';
import '@/styles/time-step-node.css';

interface XYTimeStepNodeProps {
    data: {
        head: {
            robot_map: Map<string, Robot>;
            query: string;
            highlightColor: string[];
            getTime: () => number;
            next: TimeStepNode[];
            id: string;
            type: "Robot Assignment" | "Query" | "Robot Moving";
            resolvedQuestions: Map<string, string>;
        }
        edges: { handle_id: string; }
        onNodeSelect?: (robotMap: Map<string, Robot>) => void;
        highlightMode?: 'cost' | 'time' | 'none';
    };
}


const XYTimeStepNode = memo((props: XYTimeStepNodeProps) => {
    const { data } = props;
    const reactFlow = useReactFlow();
    const [isSelected, setIsSelected] = useState(false);
    const highlightMode = data.highlightMode || 'none';

    const handleNodeClick = useCallback(() => {
        setIsSelected(true);
        setTimeout(() => setIsSelected(false), 300);
        data.onNodeSelect?.(data.head?.robot_map || new Map<string, Robot>());
    }, [data.onNodeSelect, data.head?.robot_map]);

    const addNode = useCallback((to: TimeStepNode, sourceHandleId: string) => {
        const currentNode = reactFlow.getNode(data.head?.id);
        if (!currentNode) return;
        
        const allNodes = reactFlow.getNodes() as LayoutNode[];
        const allEdges = reactFlow.getEdges();
        
        const buttonIndex = parseInt(sourceHandleId.split('-')[1]) || 0;
        const buttonCount = data.head?.next?.length || 0;
        
        const optimalPosition = calculateOptimalNodePosition(
            currentNode as LayoutNode,
            allNodes,
            allEdges
        );
        
        const newNode = {
            id: to.id,
            type: 'xyTimeStepNode',
            data: { 
                head: to, 
                edges: { handle_id: nanoid() },
                onNodeSelect: data.onNodeSelect,
                highlightMode: highlightMode
            },
            position: optimalPosition,
        };
        
        reactFlow.addNodes(newNode);
        reactFlow.addEdges([{
            id: `${data.head?.id}-${to.id}`,
            source: data.head?.id,
            target: to.id,
            sourceHandle: sourceHandleId,
            data: { highlightColor: to.highlightColor, buttonIndex, buttonCount },
            targetHandle: 'target',
            animated: true,
            type: 'customSmoothStep',
            style: { stroke: getColor(to.highlightColor, highlightMode) }
        }]);
    }, [reactFlow, data.head?.id, data.onNodeSelect, highlightMode]);

    const deleteNode = useCallback(() => {
        const edges = reactFlow.getEdges();
        const connectedEdges = edges.filter(edge => edge.source === data.head?.id || edge.target === data.head?.id);
        reactFlow.deleteElements({ edges: connectedEdges, nodes: [{ id: data.head?.id }] });
    }, [reactFlow, data.head?.id]);

    if (!data.head) {
        return <EmptyNode />;
    }

    const { robot_map, next, id, query, type, resolvedQuestions } = data.head;
    const isLeafNode = !next || next.length === 0;
    const selectedStyle = getSelectedStyle(isSelected);

    return (
        <div 
            className={`time-step-node ${isSelected ? 'selected' : ''}`}
            style={{ 
                ...selectedStyle,
                color: getColor(data.head.highlightColor, highlightMode),
                borderColor: getColor(data.head.highlightColor, highlightMode),
            }} 
            title={id} 
            onClick={handleNodeClick}
        >
            <button 
                onClick={deleteNode} 
                className="delete-button" 
                title="Delete node"
                style={{
                    backgroundColor: 'transparent',
                }}
            >
                ×
            </button>
            <Handle type="target" position={Position.Left} id="target" />
            
            <div>
                <NodeHeader 
                    isLeafNode={isLeafNode} 
                    time={data.head.getTime()}
                    query={query} 
                    type={type} 
                />
                
                {isLeafNode ? (
                    <LeafNodeContent
                        robotMap={robot_map}
                        resolvedQuestions={resolvedQuestions}
                    />
                ) : (
                    <NonLeafNodeContent robotMap={robot_map} />
                )}
            </div>

            {!isLeafNode && (
                <div className="next-buttons-container">
                    {next.map((node, nodeIndex) => (
                        <NextNodeButton
                            key={nodeIndex}
                            node={node}
                            nodeIndex={nodeIndex}
                            onAddNode={addNode}
                            parentType={data.head.type}
                            highlightMode={highlightMode}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

XYTimeStepNode.displayName = 'XYTimeStepNode';

export default XYTimeStepNode;
