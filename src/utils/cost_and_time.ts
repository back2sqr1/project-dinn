import { TimeStepNode } from './TimeStepNode';
// called from head
const highlightColorCost = '#1e90ff'; // Blue color for highlighting
const highlightColorTime = '#ffde21'; // Yellow color
export function determine_cost(node: TimeStepNode): number {
    if (!node.next || node.next.length === 0) {
        return node.getCost();
    }
    if (node.type === "Robot Moving") {
        return determine_cost(node.next[0]);
    }
    else if (node.type === "Robot Assignment") {
        let c = Infinity;
        for (const nextNode of node.next) {
            c = Math.min(c, determine_cost(nextNode));
        }
        return c;
    }
    else if (node.type === "Query") {
        let c = 0;
        for (const nextNode of node.next) {
            c = Math.max(c, determine_cost(nextNode));
        }
        return c;
    }
    return 0; // Default case, should not happen
}

export function highlightCost(node: TimeStepNode, costValue: number): void {
    node.highlightColor.push(highlightColorCost);

    if (!node.next || node.next.length === 0) {
        return;
    }
    if (node.type === "Robot Moving") {
        highlightCost(node.next[0], costValue);
    }
    else if (node.type === "Robot Assignment" || node.type === "Query") {

        for (const nextNode of node.next) {
            if (determine_cost(nextNode) === costValue) {
                highlightCost(nextNode, costValue);
            }
        }
    }

    return; // Default case, should not happen
}

export function determine_min_time(node: TimeStepNode) : number {
    if (!node.next || node.next.length === 0) {
        return node.getTime();
    }
    let time = Infinity;
    for (const nextNode of node.next) {
        time = Math.min(time, determine_min_time(nextNode));
    }
    return time;
}

export function highlightTime(node: TimeStepNode, timeValue: number): void {
    node.highlightColor.push(highlightColorTime);

    if (!node.next || node.next.length === 0) {
        return;
    }
    for (const nextNode of node.next) {
        if (determine_min_time(nextNode) === timeValue) {
            highlightTime(nextNode, timeValue);
        }
    }
}

export function getColor(highlightColor: string[], highlightMode: 'cost' | 'time' | 'none' = 'none') {
    // If no highlight mode is selected, use default green
    if (highlightMode === 'none') {
        return '#00ee00';
    }
    
    // If no colors are available, use default green
    if (highlightColor.length === 0) {
        return '#00ee00';
    }
    
    // Based on highlight mode, choose the appropriate color
    if (highlightMode === 'cost') {
        // Look for blue color (cost highlighting)
        const costColor = highlightColor.find(color => color === '#1e90ff');
        return costColor || '#00ee00';
    }
    
    if (highlightMode === 'time') {
        // Look for yellow color (time highlighting)  
        const timeColor = highlightColor.find(color => color === '#ffde21');
        return timeColor || '#00ee00';
    }
    
    // Fallback to default green
    return '#00ee00';
}

