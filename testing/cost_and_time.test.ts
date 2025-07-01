import { determine_cost, highlightCost } from "@/utils/cost_and_time";
import { TimeStepNode } from "@/utils/TimeStepNode";
import search from "@/utils/search";
import { Robot } from "@/utils/Robot";
import { RobotMap } from "@/utils/RobotManager";

test("Cost of a single node", () => {
    const node = new TimeStepNode(
        {
            id: "1",
            robot_map: new Map(),
            query: "Test Query",
            next: [],
            type: "Robot Assignment",
            resolvedQuestions: new Map(),
        }
    );
    expect(determine_cost(node)).toBe(0);
});

test("Cost of a node with next nodes", () => {
    const parsedData = {
        "size": [10, 10],
        "props": ["p", "p'", "p''"],
        "locations": {
            "a": [1, 0],
            "b": [3, 0]
        },
        "edges": {
            "p": ["p'", "p''"],
            "p'": ["true", "false"],
            "p''": ["false", "true"]
        },
        "prop_to_location": {
            "p": ["a"],
            "p'": ["b"],
            "p''": ["b"]
        },
        "starting_prop": "p"
    }
})
