export interface Robot {
    id: string;
    location: [number, number];
    velocity: number;
}

export interface RobotDescriptionsProps {
    robot_count: number;
}