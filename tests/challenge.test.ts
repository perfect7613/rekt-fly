import { test } from "node:test";
import assert from "node:assert/strict";
import { health, protection } from "../web/src/lib/challenge";

test("official two-decimal health calculation floors like the contract", () => {
  assert.equal(health(500n, 700000n, 200000n), 1.11);
  assert.equal(health(500n, 0n, 200000n), Infinity);
});
test("protection alternatives reach target with minimal whole token units", () => {
  const c = 500n,
    d = 700000n,
    p = 200000n;
  const plan = protection(c, d, p);
  assert.equal(plan.deposit, 39n);
  assert.ok(health(c + plan.deposit, d, p) >= 1.2);
  assert.ok(health(c + plan.deposit - 1n, d, p) < 1.2);
  assert.ok(health(c, d - plan.repay, p) >= 1.2);
  assert.ok(health(c, d - plan.repay + 1n, p) < 1.2);
  assert.deepEqual(protection(1000n, d, p), { deposit: 0n, repay: 0n });
});
