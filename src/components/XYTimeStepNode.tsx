import React, { memo, useCallback } from 'react';
import { Robot, TimeStepNode } from '@/utils/search';
import { nanoid } from 'nanoid';
import { Handle, Position, useUpdateNodeInternals, useReactFlow } from '@xyflow/react';

interface XYTimeStepNodeProps {
    data: {
        head: {
            robot_map : Map<string, Robot>;
            next: TimeStepNode[];
            id: string;
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

    const { robot_map, next, id} = data.head;
    
    const addNode = useCallback((to: TimeStepNode, sourceHandleId: string) => {
        const currentPosition = reactFlow.getNode(id)?.position || { x: 0, y: 0 };
        const newNode = {
            id: to.id,
            type: 'xyTimeStepNode',
            data: { head: to, edges: { handle_id: nanoid() } },
            position: { x: currentPosition.x + 400, y: currentPosition.y }
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
        const edgeIds = connectedEdges.map(edge => edge.id);
        
        // Remove edges first, then the node
        reactFlow.deleteElements({ edges: connectedEdges, nodes: [{ id }] });
    }, [reactFlow, id]);

    // Helper function to check if two nodes have the same robot positions and visited locations
    const hasSameProperties = (node1: TimeStepNode, node2: TimeStepNode) => {
        const robotMap1 = Array.from(node1.robot_map.entries()).map(([key, robot]) => `${key}:${robot.position}`).join(',');
        const robotMap2 = Array.from(node2.robot_map.entries()).map(([key, robot]) => `${key}:${robot.position}`).join(',');
        const visited1 = Array.from(node1.visitedLocations).sort().join(',');
        const visited2 = Array.from(node2.visitedLocations).sort().join(',');
        return robotMap1 === robotMap2 && visited1 === visited2;
    };

    // Group next nodes by similar properties
    const groupedNext = [];
    const processed = new Set<number>();

    for (let i = 0; i < next.length - 1; i++) {
        if (hasSameProperties(next[i], next[i + 1])) {
            // Find the existing group for next[i] or create a new one
            let existingGroup = groupedNext.find(group => group.includes(next[i]));
            
            if (existingGroup) {
                existingGroup.push(next[i + 1]);
            } else {
                groupedNext.push([next[i], next[i + 1]]);
            }
            
            processed.add(i);
            processed.add(i + 1);
        }
    }

    // Add remaining ungrouped nodes as individual groups
    for (let i = 0; i < next.length; i++) {
        if (!processed.has(i)) {
            groupedNext.push([next[i]]);
        }
    }

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
                <h4 style={{ fontSize: '12px' }}>Robot Map:</h4>
                <div style={{ fontSize: '12px', marginBottom: '2px' }}>
                    {Array.from(robot_map.entries()).map(([key, robot]) => `${key}: ${robot.position}`).join(', ')}
                </div>
            </div>
                {next && next.length > 0 && (
                    <>
                        <hr/>
                        {/* Next TimeStepNodes Section */}
                        <h4 style={{ fontSize: '12px' }}>Next Steps:</h4>
                        <div>
                            {groupedNext.map((group, groupIndex) => {
                                const firstNode = group[0];
                                return (
                                    <div key={groupIndex} style={{ position: 'relative', marginBottom: 'px', border: '1px solid #00ee00', borderRadius: '4px', padding: '4px' }}>
                                        {/* Shared information */}
                                        <div style={{ fontSize: '11px'}}>
                                            <div><strong>Robots:</strong> {Array.from(firstNode.robot_map.entries()).map(([key, robot]) => `${key}:${robot.position}`).join(', ')}</div>
                                            <div><strong>Visited:</strong> {Array.from(firstNode.visitedLocations).join(', ')}</div>
                                        </div>
                                        {/* Query buttons */}
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0'}}>
                                            {group.map((node, nodeIndex) => {
                                                const handleId = `next-${groupIndex}-${nodeIndex}`;
                                                return (
                                                    <div key={nodeIndex} style={{ position: 'relative', marginBottom: 'px' }}>
                                                        <button 
                                                            className="text-left hover:bg-[#1b2e1b] px-[10px] w-full border rounded"
                                                            style={{ padding: '2px', fontSize: '10px', display: 'block'}}
                                                            onClick={() => addNode(node, handleId)}
                                                        >
                                                            <div>
                                                                <div><strong>Query:</strong> {node.query} </div>
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
                                                                right: '-18px'
                                                            }}
                                                        />
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}
        </div>
    );
});