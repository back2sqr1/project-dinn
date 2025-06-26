import React, { memo, useCallback, useState } from 'react';
import { TimeStepNode } from '@/utils/TimeStepNode';
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
            type: "Robot Assignment" | "Query";
            resolvedQuestions: Map<string, string>;
        }
        edges: { handle_id: string; }
        onNodeSelect?: (robotMap: Map<string, Robot>) => void;
    };
}

export default memo((props: XYTimeStepNodeProps) => {
    const { data } = props;
    const reactFlow = useReactFlow();
    const [isSelected, setIsSelected] = useState(false);

    if (!data.head) {
        return (
            <div style={{ border: '1px solid', padding: '2px', borderRadius: '4px' }}>
                <div>Empty node</div>
                <Handle type="target" position={Position.Left} id="target" />
            </div>
        );
    }

    const { robot_map, next, id, query, type } = data.head;
    const { onNodeSelect } = data;

    const handleNodeClick = useCallback(() => {
        setIsSelected(true);
        setTimeout(() => setIsSelected(false), 300);
        onNodeSelect?.(robot_map);
    }, [onNodeSelect, robot_map]);

    const addNode = useCallback((to: TimeStepNode, sourceHandleId: string) => {
        const currentPosition = reactFlow.getNode(id)?.position || { x: 0, y: 0 };
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
            id: `${id}-${to.id}`,
            source: id,
            target: to.id,
            sourceHandle: sourceHandleId,
            targetHandle: 'target',
            animated: true,
            type: 'smoothstep',
        }]);
    }, [reactFlow, id, data.onNodeSelect]);

    const deleteNode = useCallback(() => {
        const edges = reactFlow.getEdges();
        const connectedEdges = edges.filter(edge => edge.source === id || edge.target === id);
        reactFlow.deleteElements({ edges: connectedEdges, nodes: [{ id }] });
    }, [reactFlow, id]);

    const nodeStyle = {
        border: '1px #00ee00 solid',
        padding: '10px',
        borderRadius: '4px',
        minWidth: '150px',
        position: 'relative' as const,
        cursor: 'pointer',
        transform: isSelected ? 'scale(1.01)' : 'scale(1)',
        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        boxShadow: isSelected ? '0 4px 12px rgb(6, 147, 6)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
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

    return (
        <div style={nodeStyle} title={id} onClick={handleNodeClick}>
            <button onClick={deleteNode} style={deleteButtonStyle} title="Delete node">×</button>
            <Handle type="target" position={Position.Left} id="target" />
            
            <div>
                <h4 style={{ fontSize: '12px' }}>Node Info:</h4>
                <div style={{ fontSize: '12px', marginBottom: '2px' }}>
                    {Array.from(robot_map.entries()).map(([key, robot]) => 
                        `${key}: ${robot.position} (${Math.round(robot.cost)})`
                    ).join(', ')} ({query})
                </div>
            </div>

            {next && next.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                    {next.map((node, nodeIndex) => {
                        const handleId = `next-${nodeIndex}`;
                        return (
                            <div key={nodeIndex} style={{ position: 'relative', marginBottom: '2px' }}>
                                <button 
                                    className="text-left hover:bg-[#1b2e1b] px-[10px] w-full border rounded"
                                    style={{ padding: '2px', fontSize: '10px', display: 'block' }}
                                    onClick={() => addNode(node, handleId)}
                                >
                                    {type === "Robot Assignment" ? (
                                        <div>{Array.from(node.robot_map.entries()).map(([key, robot]) => 
                                            `${key}:${robot.position} (${robot.assignedLoc})`
                                        ).join(', ')}</div>
                                    ) : (
                                        <div>{Array.from(node.resolvedQuestions.entries()).map(([key, value]) => 
                                            `${key}:${value}`
                                        ).join(', ')} ({node.query})</div>
                                    )}
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
                    })}
                </div>
            )}
        </div>
    );
});
