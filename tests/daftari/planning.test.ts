import {test} from "node:test";
import assert from "node:assert/strict";
import {planScenario} from "../../lib/daftari/planning";
test("break even rounds units up",()=>assert.deepEqual(planScenario(100,40,10,5),{breakEvenUnits:4,revenue:200,profit:50}));
test("no break even at nonpositive margin",()=>assert.equal(planScenario(100,10,10,5)?.breakEvenUnits,null));
test("reject invalid units",()=>assert.equal(planScenario(100,40,10,1.5),null));
