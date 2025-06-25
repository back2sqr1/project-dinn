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
            </div>
        );
    };
    const { robot_map, next, id} = data.head;
    
    const addNode = useCallback((to: TimeStepNode) => {
        const currentPosition = reactFlow.getNode(id)?.position || { x: 0, y: 0 };
        
        const newNode = {
            id: to.id,
            type: 'xyTimeStepNode',
            data: { head: to,  edges: { handle_id: nanoid() } },
            position: { x: currentPosition.x + 500, y: currentPosition.y + 500}
        };
        reactFlow.addNodes(newNode);
        reactFlow.addEdges([{
            id: `${id}-${newNode.id}`,
            source: id,
            target: newNode.id,
            sourceHandle: id,
            targetHandle: 'target',
            animated: true,
            type: 'smoothstep',
        }]);
    }, [reactFlow]);

    
    

    // console.log(robot_map, next);
  return (
    <div 
        className="" 
        style={{ border: '1px solid', padding: '10px', borderRadius: '4px' }}
        title={id}
    >
    <div>
        <h4>Robot Map:</h4>
        <ul>
            <div>{Array.from(robot_map.entries()).map(([key, robot]) => `${key}: ${robot.position}`).join(', ')}</div>
        </ul>
        <hr/>
        <h4>Next</h4>
        <ul >
            {
                next.map((node, index) => (
                    <li key={index} >
                        <button 
                            className="text-left hover:bg-[#1b2e1b] px-[10px] w-full"
                            onClick={() => {
                                // Handle node selection for xyflow
                                console.log('Selected node:', node);
                                addNode(node);
                            }}
                        >
                            {Array.from(node.robot_map.entries()).map(([key, robot]) => `${key}: ${robot.position}`).join(', ')}
                        </button>
                    </li>
                ))
            }
        </ul>
    </div>

    </div>
  );
});