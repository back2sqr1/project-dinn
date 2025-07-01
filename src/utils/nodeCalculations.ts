import { Robot } from '@/utils/Robot';
import { TimeStepNode } from '@/utils/TimeStepNode';

interface NodeData {
    robot_map: Map<string, Robot>;
    query: string;
    next: TimeStepNode[];
    type: string;
    resolvedQuestions: Map<string, string>;
    highlightColor: string[];
    id: string;
    getTime: () => number;
}

/**
 * Calculate node width based on content
 */
export function calculateNodeWidth(nodeData: NodeData): number {
    const MIN_WIDTH = 150;
    const MAX_WIDTH = 300;
    
    if (!nodeData) return MIN_WIDTH;
    
    let contentWidth = MIN_WIDTH;
    
    // Add width for robot map content
    if (nodeData.robot_map && nodeData.robot_map.size > 0) {
        const robotCount = nodeData.robot_map.size;
        const avgRobotContentWidth = 80;
        contentWidth = Math.max(contentWidth, robotCount * avgRobotContentWidth + 40);
    }
    
    // Add width for query string
    if (nodeData.query) {
        const queryWidth = nodeData.query.length * 6 + 20;
        contentWidth = Math.max(contentWidth, queryWidth);
    }
    
    // Add width for next buttons
    if (nodeData.next && nodeData.next.length > 0) {
        const buttonTextWidth = Math.max(...nodeData.next.map(n => 
            n.type ? n.type.length * 7 + 30 : 50
        ));
        contentWidth = Math.max(contentWidth, buttonTextWidth);
    }
    
    // Add width for resolved questions in leaf nodes
    if (nodeData.resolvedQuestions && nodeData.resolvedQuestions.size > 0) {
        let maxQuestionWidth = 0;
        for (const [question, answer] of nodeData.resolvedQuestions.entries()) {
            const entryWidth = (question.length + answer.length) * 6 + 40;
            maxQuestionWidth = Math.max(maxQuestionWidth, entryWidth);
        }
        contentWidth = Math.max(contentWidth, maxQuestionWidth);
    }
    
    return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, contentWidth));
}

/**
 * Get style object for selected state
 */
export function getSelectedStyle(isSelected: boolean) {
    return {
        transform: isSelected ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isSelected ? '0 4px 12px rgb(6, 147, 6)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    };
}
