import { parse } from "path";
import { location_set } from "@/utils/props_and_locations";

function resize(arr : any[], size : number, defval: any) {
    while (arr.length > size) { arr.pop(); }
    while (arr.length < size) { arr.push(defval); }
}
function contains(array: Map<string, [number, number]>, element: any): boolean {
    for (const [key, value] of array) {
        if (value[0] === element[0] && value[1] === element[1]) {
            return true;
        }
    }
    return false;
}

export default function generateFrames(parsedData: any, robots: any): string[] {
    if (!parsedData || !robots) {
        return [];
    }

    let frames: string[] = [];
    const locations = location_set(parsedData);
    // Generate frames based on robot locations
    const dims = { width: parsedData.size[0], height: parsedData.size[1] };
    // resize(frames, dims.height + 2, "");
    let frame = ``;
    for (let y = -1; y <= dims.height + 1; y++) {
        let line = "";
        for (let x = -1; x <= dims.width + 1; x++) {
            if(x == -1 || x == dims.width + 1 || y == -1 || y == dims.height + 1) {
                line += "#"; // Border
            }
            else if (contains(locations, [x, y])) {
                line += "*"; // location marker
            }
            else {
                let found = false;
                let robotMarker = "A"; // Default robot marker
                for (const robot of robots) {
                    if (robot.position[0] === x && robot.position[1] === y) {
                        line += robotMarker; // Robot marker
                        found = true;
                        break;
                    }
                    robotMarker = String.fromCharCode(robotMarker.charCodeAt(0) + 1); // Increment marker for next robot
                }
                if (!found) {
                    line += "."; // Empty space
                }
            }
        }
        frame += line + "\n";
    }
    frames.push(frame);
    frame = ``;
    for (let y = -1; y <= dims.height + 1; y++) {
        let line = "";
        for (let x = -1; x <= dims.width + 1; x++) {
            if(x == -1 || x == dims.width + 1 || y == -1 || y == dims.height + 1) {
                line += "#"; // Border
            }
            else if (contains(locations, [x, y])) {
                for (const [key, value] of locations) {
                    if (value[0] === x && value[1] === y) {
                        line += key; // Location marker
                        break;
                    }
                }
            }
            else {
                let found = false;
                let robotMarker = "A"; // Default robot marker
                for (const robot of robots) {
                    if (robot.position[0] === x && robot.position[1] === y) {
                        line += robotMarker; // Robot marker
                        found = true;
                        break;
                    }
                    robotMarker = String.fromCharCode(robotMarker.charCodeAt(0) + 1); // Increment marker for next robot
                }
                if (!found) {
                    line += "."; // Empty space
                }
            }
        }
        frame += line + "\n";
    }
    frames.push(frame);

    




    return frames;
}