import search from "@/utils/search";

import { TimeStepNode } from "@/utils/TimeStepNode";
import { _knownProperties, RobotManager } from "@/utils/RobotManager";
import { Robot } from "@/utils/Robot";
import { RobotMap } from "@/utils/RobotManager";
import { determine_cost, determine_min_time } from "@/utils/cost_and_time";
import { location_to_pin, pin_to_location, location_to_prop } from "@/utils/search";

describe("Search Functionality", () => {
    let parsedData: any;
    let robots: RobotMap;

    // One to one prop to location mapping
    beforeEach(() => {
        parsedData = {
            size: [10, 10],
            props: ["p", "p'", "p''"],
            locations: {
                "a": [1, 0],
                "b": [3, 0]
            },
            edges: {
                "p": ["p'", "p''"],
                "p'": ["true", "false"],
                "p''": ["false", "true"],
            },
            prop_to_location: {
                "p": ["a"],
                "p'": ["b"],
                "p''": ["b"]
            },
            starting_prop: "p"
        };

        robots = new Map<string, Robot>();
        robots.set("robot1", new Robot({
            id: "robot1",
            position: [0, 0],
            velocity: 1,
        }));
        robots.set("robot2", new Robot({
            id: "robot2",
            position: [0, 0],
            velocity: 2,
        }));
    });

    test("Weird Location and Properties Names", () => {
        // changing names of robots and locations

        const newParsedData = structuredClone(parsedData);
        const newRobots = new Map<string, Robot>();
        newParsedData.locations = {
            "asdoij": [1, 0],
            "ASPDok": [2, 0],
            "asdoij2": [3, 0]
        };
        newParsedData.props = ["aszz", "ASPDzzzok", "asdoizzj2"];
        newParsedData.prop_to_location = {
            "aszz": ["asdoij"],
            "ASPDzzzok": ["ASPDok"],
            "asdoizzj2": ["asdoij2"]
        };
        newParsedData.edges = {
            "aszz": ["ASPDzzzok", "asdoizzj2"],
            "ASPDzzzok": ["asASOKDPAOK", "Fadsoijasd"],
            "asdoizzj2": ["Fadsoijasd", "asASOKDPAOK"],
        };
        newParsedData.starting_prop = "aszz";
        newRobots.set("aspodkapsodkaopskd", new Robot({
            id: "aspodkapsodkaopskd",
            position: [0, 0],
            velocity: 1,
        }));
        newRobots.set("asdoij2", new Robot({
            id: "asdoij2",
            position: [0, 0],
            velocity: 2,
        }));
        const result = search(newParsedData, newRobots);
        expect(result).toBeInstanceOf(TimeStepNode);
        const node = result as TimeStepNode;

        const cost = determine_cost(node);
        expect(cost).toEqual(3);
    });

    test("Make sure no robots visit location twice", () => {
        const result = search(parsedData, robots);
        expect(result).toBeInstanceOf(TimeStepNode);
        const node = result as TimeStepNode;

        function checkRobotAssignments(node: TimeStepNode): boolean {
            if (!node) return true;
            if(node.type === "Robot Assignment") {
                for (const nextNode of node.next || []) {
                    for (const robot of nextNode.robot_map.values()) {
                        if (robot.assignedLoc && node.visitedLocations.has(robot.assignedLoc)) {
                            return false; // Robot assigned to a location it has already visited
                        }
                    }
                }
            }
            else {
                for (const nextNode of node.next || []) {
                    if (!checkRobotAssignments(nextNode)) {
                        return false;
                    }
                }
            }
            return true;
        }
        expect(checkRobotAssignments(node)).toBe(true);
    });

    test("Count Nodes in TimeStepNode 1 Robot case", () => {
        const newRobots = new Map<string, Robot>();
        newRobots.set("robot1", new Robot({
            id: "robot1",
            position: [0, 0],
            velocity: 1,
        }));

        const result = search(parsedData, newRobots);
        expect(result).toBeInstanceOf(TimeStepNode);
        const node = result as TimeStepNode;
        
        function countNodes(node: TimeStepNode | null): number {
            if (!node) return 0;
            let count = 1;
            if (node.next) {
                for (const nextNode of node.next) {
                    count += countNodes(nextNode);
                }
            }
            return count;
        }
        let count = countNodes(node);
        expect(count).toBeLessThan(158); // There should be at least one node
    });

    test("Test TimeStepNode next property (if assignment process changes this test is incorrect)", () => {
        const result = search(parsedData, robots);
        expect(result).toBeInstanceOf(TimeStepNode);
        const node = result as TimeStepNode;
        
        function countNodesChecker(node: TimeStepNode | null): boolean {
            if (!node) return true;
            if (node.next) {
                if(node.type === "Robot Moving") {
                    return node.next.length === 1; // Robot Moving nodes should not have next nodes
                }
                else if (node.type === "Robot Assignment") {
                    let robotCount = node.robot_map.size;
                    // set of all locations not visited by robots
                    let locationCount = 0;
                    for (const location of location_to_pin.keys()) {
                        if(!node.visitedLocations.has(location)) {
                            locationCount++;
                        }
                    }
                    
                    // number of Locations that satisfy given query
                    let queryCount = 0;
                    for (const loc of location_to_pin.keys()) {
                        const props = location_to_prop[loc];
                        if (props) {
                            for (const prop of props) {
                                if (prop === node.query) {
                                    queryCount++;
                                    break;
                                }
                            }
                        }
                    }




                }
            }
            return true;
        }


        const check = countNodesChecker(node);

        expect(check).toBe(true);
    })

    test("Test Velocity Time relationship", () => {
        const result = search(parsedData, robots);
        expect(result).toBeInstanceOf(TimeStepNode);
        const node = result as TimeStepNode;
        const time = determine_min_time(node);

        robots.get("robot2")!.velocity = 1;
        const result2 = search(parsedData, robots);
        const time2 = determine_min_time(result2 as TimeStepNode);


        expect(time).toBeLessThan(time2);
    });

    test("Duplicate Nodes", () => {

        const newRobots = new Map<string, Robot>();
        newRobots.set("robot1", new Robot({
            id: "robot1",
            position: [0, 0],   
            velocity: 1,
        }));
        newRobots.set("robot2", new Robot({
            id: "robot2",
            position: [0, 0],
            velocity: 1,
        }));

        const result = search(parsedData, newRobots);
        expect(result).toBeInstanceOf(TimeStepNode);
        const node = result as TimeStepNode;

        function hasDuplicateNodes(node: TimeStepNode | null): boolean {
            if (!node) return false;
            const visitedNodes: TimeStepNode[] = []; // Use array instead of Set
            
            function traverse(currentNode: TimeStepNode): boolean {
                // Use custom equals method for comparison
                if (visitedNodes.some(visited => visited.equals(currentNode))) {
                    return true; // Content duplicate found
                }
                visitedNodes.push(currentNode);
                for (const next of currentNode.next || []) {
                    if (traverse(next)) {
                        return true;
                    }
                }
                return false;
            }
            return traverse(node);
        }

        expect(hasDuplicateNodes(node)).toBe(false);
    })

    test("TimeStepNode equality check", () => {
        const TimeStepNode1 = new TimeStepNode({
            id: "1",
            robot_map: new Map<string, Robot>(),
            query: "Test Query",
            next: [],
            type: "Robot Assignment",
            resolvedQuestions: new Map<string, string>(),
        });
        const TimeStepNode2 = new TimeStepNode({
            id: "2",
            robot_map: new Map<string, Robot>(),
            query: "Test Query",
            next: [],
            type: "Robot Assignment",
            resolvedQuestions: new Map<string, string>(),
        });
        expect(TimeStepNode1.equals(TimeStepNode2)).toBe(true);
    });

    test("Duplicate Nodes (HARD)", () => {

        const newParsedData = {
            "size" : [50, 10],
            "starting_prop": "p",

            "props" : [
                "p",
                "p'",
                "p''",
                "p'''",
                "p'''"
            ],
            

            "locations" : {
                "a" : [5, 5],
                "b" : [30, 7],
                "c" : [16, 5],
                "d" : [0, 0],
                "e" : [10, 10]
            },
            "edges" : {
                "p" : ["p'", "p'''"],
                "p'" : ["p'''", "p''"],
                "p''" : ["true", "false"],
                "p'''": ["p''", "false"]
            },

            "prop_to_location" : {
                "p" : ["a"],
                "p'" : ["b", "e"],
                "p''" : ["b", "d", "e"],
                "p'''": ["d"]
            }
        };

        const newRobots = new Map<string, Robot>();
        newRobots.set("robot1", new Robot({
            id: "robot1",
            position: [1, 1],   
            velocity: 1,
        }));
        newRobots.set("robot2", new Robot({
            id: "robot2",
            position: [1, 1],
            velocity: 1,
        }));

        const result = search(newParsedData, newRobots);
        expect(result).toBeInstanceOf(TimeStepNode);
        const node = result as TimeStepNode;

        

        function hasDuplicateNodes(node: TimeStepNode | null): boolean {
            if (!node) return false;
            const visitedNodes: TimeStepNode[] = []; // Use array instead of Set
            
            function traverse(currentNode: TimeStepNode): boolean {
                // Use custom equals method for comparison
                if (visitedNodes.some(visited => visited.equals(currentNode))) {
                    return true; // Content duplicate found
                }
                visitedNodes.push(currentNode);
                for (const next of currentNode.next || []) {
                    if (traverse(next)) {
                        return true;
                    }
                }
                return false;
            }
            return traverse(node);
        }

        expect(hasDuplicateNodes(node)).toBe(false);
    })

    test("Check Robot Assignment Next Node Count", () => {
        // look through all TimeStepNodes and count how many Robot Assignment nodes there are
        const newParsedData = {
            "size" : [50, 10],
            "starting_prop": "p",

            "props" : [
                "p",
                "p'",
                "p''",
                "p'''",
                "p'''"
            ],
            

            "locations" : {
                "a" : [5, 5],
                "b" : [30, 7],
                "c" : [16, 5],
                "d" : [0, 0],
                "e" : [10, 10]
            },
            "edges" : {
                "p" : ["p'", "p'''"],
                "p'" : ["p'''", "p''"],
                "p''" : ["true", "false"],
                "p'''": ["p''", "false"]
            },

            "prop_to_location" : {
                "p" : ["a"],
                "p'" : ["b", "c"],
                "p''" : ["d", "c"],
                "p'''": ["e"]
            }
        };

        const newRobots = new Map<string, Robot>();
        newRobots.set("robot1", new Robot({
            id: "robot1",
            position: [1, 1],   
            velocity: 1,
        }));
        newRobots.set("robot2", new Robot({
            id: "robot2",
            position: [1, 1],
            velocity: 1,
        }));
        const result = search(newParsedData, newRobots);
        expect(result).toBeInstanceOf(TimeStepNode);
        const node = result as TimeStepNode;
        
        function countRobotAssignments(node: TimeStepNode | null): boolean {
            if (!node) return true;
            
            if(node.type === "Robot Assignment") {
                let nextCount = node.next?.length;
                const knownProperties = _knownProperties(node.visitedLocations);
                // count number of locations that contain at least one unknown property
                let unknownCount = 0;
                for (const location of location_to_pin.keys()) {
                    for (const prop of location_to_prop[location] || []) {
                        if (!knownProperties.has(prop)) {
                            unknownCount++;
                            break; // Only count each location once
                        }
                    }
                }
                // knowing there are only 2 robots and each property only has 1 location, there are 2 * (unknownCount + 1) assignments
                const totalAssignments = 2 * (unknownCount);
                return nextCount === totalAssignments;
            }
            else {
                let check = true;
                for (const nextNode of node.next || []) {
                    check &&= countRobotAssignments(nextNode);
                }
                return check;
            }

        }

        expect(countRobotAssignments(node)).toBe(true);
    });
});