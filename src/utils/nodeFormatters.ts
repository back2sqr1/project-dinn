import { TimeStepNode } from '@/utils/TimeStepNode';

/**
 * Gets the button content for a TimeStepNode based on parent type
 */
export function getButtonContent(node: TimeStepNode, parentType: string): string {
    return node.toString(parentType);
}

export function getSelectedStyle(isSelected: boolean) {
    return {
        transform: isSelected ? 'scale(1.01)' : 'scale(1)',
        boxShadow: isSelected ? '0 4px 12px rgb(6, 147, 6)' : '0 2px 4px rgba(0, 0, 0, 0.1)',
    };
}


/**
 * Gets the type abbreviation for display
 */
export function getTypeAbbreviation(type: string, isLeafNode: boolean): string {
    if (isLeafNode) return 'LEAF';
    
    switch (type) {
        case "Query": return "Q";
        case "Robot Assignment": return "RA";
        case "Robot Moving": return "Move";
        default: return "";
    }
}

/**
 * Formats time display for node header
 */
export function getTimeDisplay(time: number, isLeafNode: boolean): string {
    return isLeafNode ? '' : `Time: ${Math.round(time || 0)}`;
}

/**
 * Formats robot position for display
 */
export function formatRobotPosition(position: number[]): string {
    return position.map(val => Math.round(val)).join(', ');
}

/**
 * Formats robot cost for display
 */
export function formatRobotCost(cost: number): number {
    return Math.round(cost * 100) / 100;
}

/**
 * Formats robot time for display
 */
export function formatRobotTime(time?: number): string {
    return time ? `${Math.round(time * 100) / 100}` : 'N/A';
}
