import { determine_cost, highlightCost } from "@/utils/cost_and_time";
import { TimeStepNode } from "@/utils/TimeStepNode";

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