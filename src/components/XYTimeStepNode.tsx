import React, { memo, useCallback, useState } from 'react';
import { TimeStepNode, reachedDestination } from '@/utils/TimeStepNode';
import { Robot } from '@/utils/Robot';
import { nanoid } from 'nanoid';
import { Handle, Position, useReactFlow } from '@xyflow/react';

interface XYTimeStepNodeProps {
    data: {
        head: {
            robot_map: Map<string, Robot>;
            query: string;
            next: TimeStepNode[];
            id: string;
            type: "Robot Assignment" | "Query" | "Robot Moving";
            resolvedQuestions: Map<string, string>;
        }
        edges: { handle_id: string; }
        onNodeSelect?: (robotMap: Map<string, Robot>) => void;
    };
}


const nodeStyle = {
    border: '1px #00ee00 solid',
    padding: '10px',
    borderRadius: '4px',
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
};

const deleteButtonStyle = {
    position: 'absolute' as const,
    top: '2px',
    right: '2px',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '16px',
    fontSize: '12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
};


function getSelectedStyle(isSelected: boolean) {
    return {
        transform: isSelected ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isSelected ? '0 4px 12px rgb(6, 147, 6)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    };
}

function EmptyNode() {
    return (
        <div style={{ border: '1px solid', padding: '2px', borderRadius: '4px' }}>
            <div>Empty node</div>
            <Handle type="target" position={Position.Left} id="target" />
        </div>
    );
}

function NodeHeader({ isLeafNode, robotMap, query, type }: {
    isLeafNode: boolean;
    robotMap: Map<string, Robot>;
    query: string;
    type: string;
}) {
    const timeDisplay = isLeafNode ? 'Leaf Node' : `Time: ${Math.round(robotMap.get('A')?.time || 0)}`;
    const typeAbbreviation = isLeafNode ? 'LEAF' : 
        type === "Query" ? "Q" : 
        type === "Robot Assignment" ? "RA" : 
        type === "Robot Moving" ? "Move" : "";

    return (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
            <h4 style={{ margin: 0 }}>{timeDisplay}</h4>
            <p>({query})</p>
            <span style={{ color: 'white', borderRadius: '3px', fontSize: '10px' }}>
                {typeAbbreviation}
            </span>
        </div>
    );
}

function RobotInfo({ robotId, robot }: { robotId: string; robot: Robot }) {
    return (
        <div key={robotId} style={{ fontSize: '9px' }}>
            <strong>{robotId}:</strong>
            <div style={{ paddingLeft: '8px' }}>
                {robot.position.map(val => Math.round(val)).join(', ')}<br/>
                Cost: {Math.round(robot.cost * 100) / 100}<br/>
                Time: {robot.time ? `${Math.round(robot.time * 100) / 100}` : 'N/A'}<br/>
            </div>
        </div>
    );
}

function ResolvedQuestions({ resolvedQuestions }: { resolvedQuestions: Map<string, string> }) {
    return (
        <div style={{ fontSize: '9px', marginTop: '6px' }}>
            <strong>Resolved Questions:</strong>
            {Array.from(resolvedQuestions.entries()).map(([key, value]) => (
                <div key={key} style={{ paddingLeft: '8px' }}>
                    {key}: {value}
                </div>
            ))}
        </div>
    );
}

function LeafNodeContent({ query, robotMap, type, resolvedQuestions }: {
    query: string;
    robotMap: Map<string, Robot>;
    type: string;
    resolvedQuestions: Map<string, string>;
}) {
    return (
        <div>
            <div style={{ fontSize: '11px', fontWeight: 'bold' }}>
                Query: {query}
            </div>
            <div style={{ fontSize: '10px' }}>
                <strong>Robots:</strong>
            </div>
            {Array.from(robotMap.entries()).map(([robotId, robot]) => (
                <RobotInfo key={robotId} robotId={robotId} robot={robot} />
            ))}
            {type === "Query" && <ResolvedQuestions resolvedQuestions={resolvedQuestions} />}
        </div>
    );
}

function NonLeafNodeContent({ robotMap }: { robotMap: Map<string, Robot> }) {
    const robotsDisplay = Array.from(robotMap.entries())
        .map(([key, robot]) => `${key}: ${robot.position.map(val => Math.round(val)).join(', ')} (${Math.round(robot.cost)})`)
        .join(', ');

    return (
        <div style={{ fontSize: '12px', marginBottom: '2px' }}>
            {robotsDisplay}
        </div>
    );
}

function getButtonContent(node: TimeStepNode, parentType: string): string {
    return node.toString(parentType);
}

function NextNodeButton({ node, nodeIndex, onAddNode, parentType }: {
    node: TimeStepNode;
    nodeIndex: number;
    label?: string;
    onAddNode: (node: TimeStepNode, handleId: string) => void;
    parentType?: string;
}) {
    const handleId = `next-${nodeIndex}`;
    let buttonContent = "";
    if (parentType) {
        buttonContent = getButtonContent(node, parentType);
    }

    return (
        <div key={nodeIndex} style={{ position: 'relative', marginBottom: '2px' }}>
            <button 
                className="text-left hover:bg-[#1b2e1b] px-[10px] w-full border rounded"
                style={{ padding: '2px', fontSize: '10px', display: 'block' }}
                onClick={() => onAddNode(node, handleId)}
            >
                {buttonContent}
            </button>
            
            <Handle 
                type="source" 
                position={Position.Right} 
                id={handleId}
                style={{ 
                    top: '60%', 
                    transform: 'translateY(-50%)',
                    position: 'absolute',
                    right: '-13px'
                }}
            />
        </div>
    );
}

const XYTimeStepNode = memo((props: XYTimeStepNodeProps) => {
    const { data } = props;
    const reactFlow = useReactFlow();
    const [isSelected, setIsSelected] = useState(false);

    const handleNodeClick = useCallback(() => {
        setIsSelected(true);
        setTimeout(() => setIsSelected(false), 300);
        data.onNodeSelect?.(data.head?.robot_map || new Map<string, Robot>());
    }, [data.onNodeSelect, data.head?.robot_map]);

    const addNode = useCallback((to: TimeStepNode, sourceHandleId: string) => {
        console.log(to.type, "TYPE");
        const currentPosition = reactFlow.getNode(data.head?.id)?.position || { x: 0, y: 0 };
        const newNode = {
            id: to.id,
            type: 'xyTimeStepNode',
            data: { 
                head: to, 
                edges: { handle_id: nanoid() },
                onNodeSelect: data.onNodeSelect
            },
            position: { x: currentPosition.x + 200, y: currentPosition.y }
        };
        
        reactFlow.addNodes(newNode);
        reactFlow.addEdges([{
            id: `${data.head?.id}-${to.id}`,
            source: data.head?.id,
            target: to.id,
            sourceHandle: sourceHandleId,
            targetHandle: 'target',
            animated: true,
            type: 'smoothstep',
        }]);
    }, [reactFlow, data.head?.id, data.onNodeSelect]);

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
            style={{ ...nodeStyle, ...selectedStyle }} 
            title={id} 
            onClick={handleNodeClick}
        >
            <button onClick={deleteNode} style={deleteButtonStyle} title="Delete node">×</button>
            <Handle type="target" position={Position.Left} id="target" />
            
            <div>
                <NodeHeader 
                    isLeafNode={isLeafNode} 
                    robotMap={robot_map} 
                    query={query} 
                    type={type} 
                />
                
                {isLeafNode ? (
                    <LeafNodeContent 
                        query={query} 
                        robotMap={robot_map} 
                        type={type} 
                        resolvedQuestions={resolvedQuestions} 
                    />
                ) : (
                    <NonLeafNodeContent robotMap={robot_map} />
                )}
            </div>

            {!isLeafNode && next && next.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {next.map((node, nodeIndex) => (
                        <NextNodeButton
                            key={nodeIndex}
                            node={node}
                            nodeIndex={nodeIndex}
                            label={node.label || ""}
                            onAddNode={addNode}
                            parentType={data.head.type}
                        />
                    ))}
                </div>
            )}
        </div>
    );
});

XYTimeStepNode.displayName = 'XYTimeStepNode';

export default XYTimeStepNode;
