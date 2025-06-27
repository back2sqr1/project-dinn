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
    readonly label: string = 'TimeStepNode';
    next: TimeStepNode[] | null = [];
    visitedLocations: Set<string> = new Set();
    time : number = 0;

    constructor({
        id = nanoid(),
        robot_map = new Map<string, Robot>(),
        query = '',
        next = null,
        type = 'Robot Assignment',
        label = 'TimeStepNode',
        resolvedQuestions,
    }: {
        id : string;
        robot_map: RobotMap;
        query: string;
        next: TimeStepNode[] | null;
        type: 'Query' | 'Robot Assignment' | 'Robot Moving';
        label?: string;
        resolvedQuestions: Map<string, string>;
    }) {
        this.id = id;
        this.robot_map = robot_map;
        this.query = query;
        this.next = next;
        this.type = type;
        this.label = label;
        this.resolvedQuestions = resolvedQuestions;
        this.time = 0;
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
                return `${key}->${hasReachedDestination ? robot.assignedLoc : 'x'}`;
            }).join(', ');
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
                .map(([key, robot]) => `${key}:${robot.position.map(val => Math.round(val)).join(', ')} (${robot.assignedLoc})`)
                .join(', ') + ` (${typeCode})`;
        }

        if (parentType === "Robot Moving") {
            return this.robotMovingToString() + ` (${typeCode})`;
        }

        return `${this.query} (${typeCode}) DEFAULT`;
    }
}
