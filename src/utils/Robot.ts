export class Robot {
    id: string;
    velocity: number;
    position: [number, number];
    assignedLoc: string | null;
    cost: number;
    time: number;

    constructor({
        id,
        velocity = 1,
        position = [0, 0],
        assignedLoc = null,
        time = 0,
        cost = 0
    }: {
        id: string;
        velocity?: number;
        position?: [number, number];
        assignedLoc?: string | null;
        time?: number;
        cost?: number;
    }) {
        this.id = id;
        this.velocity = velocity;
        this.position = position;
        this.assignedLoc = assignedLoc;
        this.time = time;
        this.cost = cost;
    }

    toString(): string {
        return `Robot[vel=${this.velocity}, pos=[${Math.round(this.position[0])}, ${Math.round(this.position[1])}], time=${Math.round(this.time)}, cost=${Math.round(this.cost)}]`;
    }

}