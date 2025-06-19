export interface Robot {
    id: string;
    position: [number, number];
    velocity: number;
}

export interface RobotDescriptionsProps {
    robot_count: number;
}