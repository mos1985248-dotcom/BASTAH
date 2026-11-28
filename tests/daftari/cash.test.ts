import {test} from "node:test";
import assert from "node:assert/strict";
import {summarizeCash,cashDate} from "../../lib/daftari/cash";
test("cash movements do not imply profit",()=>assert.deepEqual(summarizeCash([{direction:"IN",amountMinor:BigInt(10001)},{direction:"OUT",amountMinor:BigInt(10002)}]),{incomingMinor:"10001",outgoingMinor:"10002",netMinor:"-1"}));
test("reject invalid calendar day",()=>assert.equal(cashDate("2026-02-30"),null));
test("valid Riyadh date",()=>assert.equal(cashDate("2026-11-28")?.toISOString(),"2026-11-28T09:00:00.000Z"));
