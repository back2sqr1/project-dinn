import { determine_cost, highlightCost } from "@/utils/cost_and_time";
import { TimeStepNode } from "@/utils/TimeStepNode";
import search from "@/utils/search";
import { Robot } from "@/utils/Robot";
import { RobotMap } from "@/utils/RobotManager";

// TODO: Test Idea:
/*
    Go through all true or false combinations of properties resolved, see which one has be the lowest 
    worst case cost, and check if the cost of the node is equal to that.
*/

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

test("All true or false combinations of properties", () => {
    

}); 
