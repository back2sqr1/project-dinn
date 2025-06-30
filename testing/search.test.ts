import search from "@/utils/search";

import { TimeStepNode } from "@/utils/TimeStepNode";
import { RobotManager } from "@/utils/RobotManager";
import { Robot } from "@/utils/Robot";
import { RobotMap } from "@/utils/RobotManager";
import { determine_cost, determine_min_time } from "@/utils/cost_and_time";

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

    test("Weird Location and Properties", () => {
        // changing names of robots and locations
        parsedData.locations = {
            "asdoij": [1, 0],
            "ASPDok": [2, 0],
            "asdoij2": [3, 0]
        };
        parsedData.props = ["aszz", "ASPDzzzok", "asdoizzj2"];
        parsedData.prop_to_location = {
            "aszz": ["asdoij"],
            "ASPDzzzok": ["ASPDok"],
            "asdoizzj2": ["asdoij2"]
        };
        parsedData.edges = {
            "aszz": ["ASPDzzzok", "asdoizzj2"],
            "ASPDzzzok": ["asASOKDPAOK", "Fadsoijasd"],
            "asdoizzj2": ["Fadsoijasd", "asASOKDPAOK"],
        };
        parsedData.starting_prop = "aszz";
        const result = search(parsedData, robots);
        expect(result).toBeInstanceOf(TimeStepNode);
        const node = result as TimeStepNode;

        const cost = determine_cost(node);
        expect(cost).toEqual(3);
    });

    test("Test TimeStepNode next property", () => {
        const result = search(parsedData, robots);
        expect(result).toBeInstanceOf(TimeStepNode);
        const node = result as TimeStepNode;
        
        function countNodes(node: TimeStepNode | null): number {
            if (!node) return 0;
            let count = 1; // Count this node
            if (node.next) {
                for (const nextNode of node.next) {
                    count += countNodes(nextNode);
                }
            }
            return count;
        }
        const nodeCount = countNodes(node);
    
        expect(nodeCount).toEqual(0);
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

});