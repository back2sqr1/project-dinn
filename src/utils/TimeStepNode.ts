import { RobotMap } from "@/utils/RobotManager";
import { Robot } from "@/utils/Robot";
import { nanoid } from "nanoid";
import { location_to_pin } from "@/utils/search";



const DISTANCE_THRESHOLD = 0.01;
export function reachedDestination(robot: Robot): boolean {
    if (!robot.assignedLoc) return false;

    const target = location_to_pin.get(robot.assignedLoc);
    if (!target) return false;
    
    const distance = Math.sqrt(
        Math.pow(robot.position[0] - target[0], 2) +
        Math.pow(robot.position[1] - target[1], 2)
    );
    return distance < DISTANCE_THRESHOLD;
}


export class TimeStepNode {
    readonly id: string = nanoid();
    readonly robot_map: RobotMap;
    readonly query: string;
    readonly type: 'Query' | 'Robot Assignment' | 'Robot Moving';
    readonly resolvedQuestions: Map<string, string>;
    highlightColor: string[] = [];
    next: TimeStepNode[] | null = [];
    visitedLocations: Set<string> = new Set();

    constructor({
        id = nanoid(),
        robot_map = new Map<string, Robot>(),
        query = '',
        next = null,
        type = 'Robot Assignment',
        highlightColor = [],
        resolvedQuestions,
    }: {
        id : string;
        robot_map: RobotMap;
        query: string;
        next: TimeStepNode[] | null;
        type: 'Query' | 'Robot Assignment' | 'Robot Moving';
        highlightColor?: string[];
        resolvedQuestions: Map<string, string>;
    }) {
        this.id = id;
        this.robot_map = robot_map;
        this.query = query;
        this.next = next;
        this.type = type;
        this.highlightColor = highlightColor;
        this.resolvedQuestions = resolvedQuestions;
    }

    equals(other: TimeStepNode): boolean {
        if (this.query !== other.query) return false;
        if (this.type !== other.type) return false;
        
        // Compare robot_map
        if (this.robot_map.size !== other.robot_map.size) return false;
        for (const [key, robot] of this.robot_map) {
            const otherRobot = other.robot_map.get(key);
            const robotEquals = robot instanceof Robot && otherRobot instanceof Robot && robot.equals(otherRobot);
            if (!otherRobot || !robotEquals) return false;
        }
        
        // Compare resolvedQuestions
        if (this.resolvedQuestions.size !== other.resolvedQuestions.size) return false;
        for (const [key, value] of this.resolvedQuestions) {
            if (other.resolvedQuestions.get(key) != value) return false;
        }
        
        // Compare visitedLocations
        if (this.visitedLocations.size !== other.visitedLocations.size) return false;
        for (const location of this.visitedLocations) {
            if (!other.visitedLocations.has(location)) return false;
        }
                
        return true;
    }

    longPrint(indent: string = "", isLast: boolean = true, layer: number = 0): string {
        let result = indent;
        result += isLast ? "└── " : "├── ";
        result += `Layer ${layer} query: ${this.query} \n`;


        const entries = Array.from(this.robot_map.entries());
        entries.forEach(([robotId, robot], index) => {
            const last = index === entries.length - 1 && (!this.next || this.next.length === 0);
            result += indent + (isLast ? "    " : "│   ");
            result += last ? "└── " : "├── ";
            robot = (Robot as any).prototype instanceof Robot ? robot : new Robot(robot);
            // Ensure robot is an instance of Robot
            result += `${robotId}: ${robot.toString()}\n`;
        });
        if (this.visitedLocations.size > 0) {
            result += indent + (isLast ? "    " : "│   ") + "vis: ";
            result += Array.from(this.visitedLocations).join(", ") + "\n";
        }
        if (this.next) {
            this.next.forEach((node, index) => {
                const childIsLast = index === this.next!.length - 1;
                result += node.longPrint(indent + (isLast ? "    " : "│   "), childIsLast, layer + 1);
            });
        }
        
        

        return result;
    }
    robotMovingToString(): string {
        return Array.from(this.robot_map.entries())
            .map(([key, robot]) => {
                const hasReachedDestination = reachedDestination(robot);
                return `${key}->${hasReachedDestination ? robot.assignedLoc : `(${robot.assignedLoc})`}`;
            }).join(', ');
    }

    getCost(): number {
        let cost = 0;
        for (const robot of this.robot_map.values()) {
            cost += robot.cost;
        }
        return cost;
    }

    getTime(): number {
        let maxTime = 0;
        for (const robot of this.robot_map.values()) {
            maxTime = Math.max(maxTime, robot.time);
        }
        return maxTime;
    }

    toString(parentType: string): string {
        const typeCode = this.type === "Query" ? "Q" : this.type === "Robot Assignment" ? "RA" : "RM";


        if(parentType === "Query") {
            if (this.type === "Robot Moving") {
                return this.robotMovingToString() + ` wait (${typeCode})`;
            }
            return `[${Array.from(this.resolvedQuestions.entries()).map(([key, value]) => `${key}:${value}`).join(', ')}] (${typeCode})`;
        }

        if (parentType === "Robot Assignment") {
            return Array.from(this.robot_map.entries())
                .map(([key, robot]) => `${key}: (${robot.assignedLoc})`)
                .join(', ') + ` (${typeCode})`;
        }

        if (parentType === "Robot Moving") {
            return this.robotMovingToString() + ` (${typeCode})`;
        }

        return `${this.query} (${typeCode}) DEFAULT`;
    }
}
