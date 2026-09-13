import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { Brain, Game, type Circuit } from "../web/src/lib/simulation.ts";
const circuit: Circuit = JSON.parse(
  fs.readFileSync(
    new URL("../web/public/data/escape-circuit.json", import.meta.url),
    "utf8",
  ),
);
test("dataset has real escape neurons and valid edges", () => {
  assert.equal(circuit.neurons.length, 316);
  assert.equal(circuit.neurons.filter((n) => n.type === "DNp01").length, 2);
  assert.equal(new Set(circuit.neurons.map((n) => n.id)).size, 316);
  for (const [a, b, w] of circuit.edges) {
    assert.ok(circuit.neurons[a]);
    assert.ok(circuit.neurons[b]);
    assert.ok(Number.isFinite(w));
  }
});
test("unstimulated reduced circuit is silent", () => {
  const b = new Brain(circuit);
  for (let i = 0; i < 20; i++) assert.equal(b.step(0, "none").DNp01, 0);
});
test("cutting both visual outputs abolishes escape with identical seeded stimulation", () => {
  const intact = new Brain(circuit, 42),
    ablated = new Brain(circuit, 42);
  let a = 0,
    b = 0;
  for (let i = 0; i < 50; i++) {
    a += intact.step(0.8, "none").DNp01;
    b += ablated.step(0.8, "both").DNp01;
  }
  assert.ok(a > 0, "intact circuit must propagate to DNp01");
  assert.equal(b, 0);
});
test("manual actions preserve balances and change health in the expected direction", () => {
  const g = new Game(circuit);
  assert.equal(g.action("deposit"), false);
  g.state.status = "running";
  const hf = g.state.hf;
  g.action("deposit");
  assert.equal(g.state.reserveETH, 4.5);
  assert.equal(g.state.collateral, 5.5);
  assert.ok(g.state.hf > hf);
  for (let i = 0; i < 100; i++) g.action("deposit");
  assert.equal(g.state.reserveETH, 0);
  assert.equal(g.action("deposit"), false);
  for (let i = 0; i < 100; i++) g.action("repay");
  assert.equal(g.state.reserveUSD, 0);
  assert.ok(g.state.debt >= 0);
});
test("reset reproduces the same market and neural response", () => {
  const g = new Game(circuit);
  const run = () => {
    g.state.status = "running";
    for (let i = 0; i < 80; i++) g.tick();
    return {
      price: g.state.price,
      hf: g.state.hf,
      position: g.state.x,
      rate: g.state.rates.DNp01,
    };
  };
  const first = run();
  g.reset();
  assert.deepEqual(run(), first);
});
test("pause freezes state and liquidation ends the round", () => {
  const g = new Game(circuit);
  g.state.status = "paused";
  g.tick();
  assert.equal(g.state.time, 0);
  g.state.status = "running";
  g.state.autopilot = false;
  for (let i = 0; i < 3; i++) g.crash();
  for (let i = 0; i < 60; i++) g.tick();
  assert.equal(g.state.status, "liquidated");
  const end = g.state.time;
  g.tick();
  assert.equal(g.state.time, end);
});
test("intact pilot survives the practice storm while the ablated control liquidates", () => {
  const intact = new Game(circuit),
    control = new Game(circuit);
  control.state.ablation = "both";
  intact.state.status = "running";
  control.state.status = "running";
  for (let i = 0; i < 1801; i++) {
    intact.tick();
    control.tick();
  }
  assert.equal(intact.state.status, "survived");
  assert.equal(control.state.status, "liquidated");
  assert.ok(intact.state.interventions > 0);
  assert.equal(control.state.interventions, 0);
});
