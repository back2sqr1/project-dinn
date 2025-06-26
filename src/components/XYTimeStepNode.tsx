import React, { memo, useCallback } from 'react';
import { TimeStepNode } from '@/utils/TimeStepNode';
import { Robot } from '@/utils/Robot';
import { nanoid } from 'nanoid';
import { Handle, Position, useUpdateNodeInternals, useReactFlow } from '@xyflow/react';

interface XYTimeStepNodeProps {
    data: {
        head: {
            robot_map : Map<string, Robot>;
            query: string;
            next: TimeStepNode[];
            id: string;
            type: "Robot Assignment" | "Query";
            resolvedQuestions: Map<string, string>;
        }
        edges: {
            handle_id: string;
        }
    };
}
 
export default memo((props: XYTimeStepNodeProps) => {
    const { data } = props;
    const reactFlow = useReactFlow();

    if(data.head === undefined) {
        return (
            <div className="" style={{ border: '1px solid', padding: '2px', borderRadius: '4px' }}>
                <div>Empty node (did not render)</div>
                <Handle type="target" position={Position.Left} id="target" />
            </div>
        );
    };

    const { robot_map, next, id, query, type } = data.head;

    const addNode = useCallback((to: TimeStepNode, sourceHandleId: string) => {
        const currentPosition = reactFlow.getNode(id)?.position || { x: 0, y: 0 };
        console.log("Type of node:", to.type);
        const newNode = {
            id: to.id,
            type: 'xyTimeStepNode',
            data: { head: to, edges: { handle_id: nanoid() } },
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
    }, [reactFlow, id]);

    const deleteNode = useCallback(() => {
        // Get all edges connected to this node
        const edges = reactFlow.getEdges();
        const connectedEdges = edges.filter(edge => edge.source === id || edge.target === id);        
        // Remove edges first, then the node
        reactFlow.deleteElements({ edges: connectedEdges, nodes: [{ id }] });
    }, [reactFlow, id]);

    return (
        <div 
            className="" 
            style={{ border: '1px solid', padding: '10px', borderRadius: '4px', minWidth: '150px', position: 'relative' }}
            title={id}
        >
            {/* Delete button */}
            <button
                onClick={deleteNode}
                style={{
                    position: 'absolute',
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
                }}
                title="Delete node"
            >
                ×
            </button>

            {/* Target handle for incoming connections */}
            <Handle type="target" position={Position.Left} id="target" />
            
            {/* Robot Map Section */}
            <div>
                <h4 style={{ fontSize: '12px' }}>Node Info:</h4>
                <div style={{ fontSize: '12px', marginBottom: '2px' }}>
                    {Array.from(robot_map.entries()).map(([key, robot]) => `${key}: ${robot.position} (${Math.round(robot.cost)})`).join(', ')}
                    {"   (" + query + ")"}
                </div>
            </div>
                {next && next.length > 0 && (
                    <>
                        {/* Next TimeStepNodes Section */}
                        <div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0'}}>
                                {next.map((node, nodeIndex) => {
                                    const handleId = `next-${nodeIndex}`;
                                    return (
                                        <div key={nodeIndex} style={{ position: 'relative', marginBottom: '2px' }}>
                                            <button 
                                                className="text-left hover:bg-[#1b2e1b] px-[10px] w-full border rounded"
                                                style={{ padding: '2px', fontSize: '10px', display: 'block'}}
                                                onClick={() => addNode(node, handleId)}
                                            >
                                                <div>
                                                    {
                                                        type === "Robot Assignment" ? 
                                                        <div>{Array.from(node.robot_map.entries()).map(([key, robot]) => `${key}:${robot.position} (${robot.assignedLoc})`).join(', ')}</div> : 
                                                            <div>{Array.from(node.resolvedQuestions.entries()).map(([key, value]) => `${key}:${value}`).join(', ')} ({node.query})</div>
                                                    }
                                                </div>
                                            </button>
                                            
                                            {/* Source handle for this specific query */}
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
                        </div>
                    </>
                )}
            
        </div>
    );
});
