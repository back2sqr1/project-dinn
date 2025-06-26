import { RobotMap } from "./search";
import { Robot } from "./Robot";
import { nanoid } from "nanoid";


export class TimeStepNode {
    readonly id: string = nanoid();
    readonly robot_map: RobotMap;
    readonly query: string;
    readonly type: 'Query' | 'Robot Assignment';
    readonly resolvedQuestions: Map<string, string>;
    next: TimeStepNode[] | null = [];
    visitedLocations: Set<string> = new Set();

    constructor({
        id = nanoid(),
        robot_map = new Map<string, Robot>(),
        query = '',
        next = null,
        type = 'Robot Assignment',
        resolvedQuestions,
    }: {
        id : string;
        robot_map: RobotMap;
        query: string;
        next: TimeStepNode[] | null;
        type: 'Query' | 'Robot Assignment';
        resolvedQuestions: Map<string, string>;
    }) {
        this.id = id;
        this.robot_map = robot_map;
        this.query = query;
        this.next = next;
        this.type = type;
        this.resolvedQuestions = resolvedQuestions;
    }

    toString(indent: string = "", isLast: boolean = true, layer: number = 0): string {
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
                result += node.toString(indent + (isLast ? "    " : "│   "), childIsLast, layer + 1);
            });
        }
        
        

        return result;
    }
}
