import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { Robot } from '@/utils/Robot';
import { TimeStepNode } from '@/utils/TimeStepNode';
import { getColor } from '@/utils/cost_and_time';
import { 
    getTypeAbbreviation, 
    getTimeDisplay, 
    formatRobotPosition, 
    formatRobotCost, 
    formatRobotTime,
    getButtonContent
} from '@/utils/nodeFormatters';

export function EmptyNode() {
    return (
        <div className="empty-node">
            <div>Empty node</div>
            <Handle type="target" position={Position.Left} id="target" />
        </div>
    );
}

export function NodeHeader({ isLeafNode, time, query, type }: {
    isLeafNode: boolean;
    time: number;
    query: string;
    type: string;
}) {
    const timeDisplay = getTimeDisplay(time, isLeafNode);
    const typeAbbreviation = getTypeAbbreviation(type, isLeafNode);

    return (
        <div className="node-header">
            <h4>{timeDisplay}</h4>
            <p>({query})</p>
            <span className="node-type-badge">
                {typeAbbreviation}
            </span>
        </div>
    );
}

export function RobotInfo({ robotId, robot }: { robotId: string; robot: Robot }) {
    return (
        <div key={robotId} className="robot-info">
            <strong>{robotId}:</strong>
            <div className="robot-details">
                {formatRobotPosition(robot.position)}<br/>
                Cost: {formatRobotCost(robot.cost)}<br/>
                Time: {formatRobotTime(robot.time)}<br/>
            </div>
        </div>
    );
}

export function ResolvedQuestions({ resolvedQuestions }: { resolvedQuestions: Map<string, string> }) {
    return (
        <div className="resolved-questions">
            [{Array.from(resolvedQuestions.entries()).map(([question, answer], index, array) => (
                <span key={question}>{question}: {answer}{index < array.length - 1 ? ', ' : ''}</span>
            ))}]
        </div>
    );
}

export function LeafNodeContent({ robotMap, resolvedQuestions }: {
    robotMap: Map<string, Robot>;
    resolvedQuestions: Map<string, string>;
}) {
    return (
        <div>
            {Array.from(robotMap.entries()).map(([robotId, robot]) => (
                <RobotInfo key={robotId} robotId={robotId} robot={robot} />
            ))}
            <ResolvedQuestions resolvedQuestions={resolvedQuestions} />
        </div>
    );
}

export function NonLeafNodeContent({ robotMap }: { robotMap: Map<string, Robot> }) {
    const robotsDisplay = Array.from(robotMap.entries())
        .map(([key, robot]) => `${key}: ${formatRobotPosition(robot.position)} (${Math.round(robot.cost)})`)
        .join(', ');

    return (
        <div className="non-leaf-content">
            {robotsDisplay}
        </div>
    );
}

export function NextNodeButton({ node, nodeIndex, onAddNode, parentType, highlightMode }: {
    node: TimeStepNode;
    nodeIndex: number;
    onAddNode: (node: TimeStepNode, handleId: string) => void;
    parentType?: string;
    highlightMode?: 'cost' | 'time' | 'none';
}) {
    const handleId = `next-${nodeIndex}`;
    const buttonContent = parentType ? getButtonContent(node, parentType) : "";

    return (
        <div key={nodeIndex} className="next-button-wrapper">
            <button 
                className="next-button text-left hover:bg-[#1b2e1b] px-[10px] w-full border rounded"
                style={{ 
                    color: getColor(node.highlightColor, highlightMode || 'none')
                }}
                onClick={() => onAddNode(node, handleId)}
            >
                {buttonContent}
            </button>
            
            <Handle 
                type="source" 
                position={Position.Right} 
                id={handleId}
                className="source-handle"
            />
        </div>
    );
}
