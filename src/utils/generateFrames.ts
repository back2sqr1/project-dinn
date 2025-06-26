import { location_set } from "@/utils/props_and_locations";

const contains = (locations: Map<string, [number, number]>, [x, y]: [number, number]): boolean => {
    return Array.from(locations.values()).some(([lx, ly]) => lx === x && ly === y);
};

const getLocationKey = (locations: Map<string, [number, number]>, [x, y]: [number, number]): string => {
    for (const [key, [lx, ly]] of locations) {
        if (lx === x && ly === y) return key;
    }
    return "";
};

const generateFrame = (
    dims: { width: number; height: number }, 
    robots: any[], 
    locations: Map<string, [number, number]>,
    showLocationKeys = false
): string => {
    let frame = "";
    
    for (let y = -1; y <= dims.height + 1; y++) {
        let line = "";
        for (let x = -1; x <= dims.width + 1; x++) {
            // Border
            if (x === -1 || x === dims.width + 1 || y === -1 || y === dims.height + 1) {
                line += "#";
                continue;
            }
            
            // Location markers
            let robotFound = false;
            let robotMarker = "A";
            for (const robot of robots) {
                if (robot.position[0] === x && robot.position[1] === y) {
                    robotFound = true;
                    break;
                }
                robotMarker = String.fromCharCode(robotMarker.charCodeAt(0) + 1);
            }

            if (contains(locations, [x, y])) {

                line += showLocationKeys ? getLocationKey(locations, [x, y]) : (robotFound ? robotMarker : "*");
                continue;
            }
            

            
            if (!robotFound) line += ".";
            else line += robotMarker;
        }
        frame += line + "\n";
    }
    
    return frame;
};

export default function generateFrames(parsedData: any, robotsOrRobotMap: any): string[] {
    if (!parsedData || !robotsOrRobotMap) return [];

    const locations = location_set(parsedData);
    const dims = { width: parsedData.size[0], height: parsedData.size[1] };
    
    // Convert robotMap to robots array if needed
    const robots = robotsOrRobotMap instanceof Map 
        ? Array.from(robotsOrRobotMap.values())
        : Array.isArray(robotsOrRobotMap) 
        ? robotsOrRobotMap 
        : [];

    return [
        generateFrame(dims, robots, locations, false), // Frame with * markers
        generateFrame(dims, robots, locations, true)   // Frame with location keys
    ];
}