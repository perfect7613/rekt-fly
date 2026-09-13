// Original implementation of a reduced LIF model; see /data/provenance.json.
export type Circuit = {
  meta: { neurons: number; edges: number; dataset: string; scope: string };
  neurons: {
    id: string;
    type: "LC4" | "LPLC2" | "DNp01";
    side: string;
    pos: number[];
  }[];
  edges: [number, number, number][];
  context: number[][];
};
export type Ablation = "none" | "LC4" | "LPLC2" | "both";
export function random(seed: number) {
  let n = seed >>> 0;
  return () => {
    n += 0x6d2b79f5;
    let t = n;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export class Brain {
  readonly voltage: Float64Array;
  readonly current: Float64Array;
  readonly refractory: Int16Array;
  readonly activity: Float32Array;
  readonly outgoing: [number, number][][];
  private queue: Float64Array[];
  private cursor = 0;
  private rng;
  rates = { LC4: 0, LPLC2: 0, DNp01: 0 };
  constructor(
    readonly circuit: Circuit,
    seed = 42,
  ) {
    const n = circuit.neurons.length;
    this.voltage = new Float64Array(n).fill(-52);
    this.current = new Float64Array(n);
    this.refractory = new Int16Array(n);
    this.activity = new Float32Array(n);
    this.outgoing = Array.from({ length: n }, () => []);
    circuit.edges.forEach(([a, b, w]) => this.outgoing[a].push([b, w * 0.275]));
    this.queue = Array.from({ length: 19 }, () => new Float64Array(n));
    this.rng = random(seed);
  }
  // 20 ms of neural time, Euler dt=0.1 ms. Not a whole-brain equivalence claim.
  step(threat: number, ablation: Ablation) {
    const counts = { LC4: 0, LPLC2: 0, DNp01: 0 };
    const population = { LC4: 0, LPLC2: 0, DNp01: 0 };
    this.circuit.neurons.forEach((n) => population[n.type]++);
    for (let t = 0; t < 200; t++) {
      const arriving = this.queue[this.cursor];
      for (let i = 0; i < this.voltage.length; i++) {
        const type = this.circuit.neurons[i].type;
        this.current[i] += arriving[i];
        arriving[i] = 0;
        // Consume the same random sequence under every ablation condition.
        const stimulus = this.rng();
        if (this.refractory[i] > 0) {
          this.refractory[i]--;
          continue;
        }
        const oldCurrent = this.current[i];
        this.current[i] *= Math.exp(-0.1 / 5);
        this.voltage[i] += (0.1 / 20) * (-52 - this.voltage[i] + oldCurrent);
        if (
          type !== "DNp01" &&
          stimulus < Math.max(0, Math.min(1, threat)) * 120 * 0.0001
        )
          this.voltage[i] += 68.75;
        if (this.voltage[i] > -45) {
          this.voltage[i] = -52;
          this.current[i] = 0;
          this.refractory[i] = 22;
          counts[type]++;
          this.activity[i] = 1;
          const silenced =
            ablation === "both" ? type !== "DNp01" : ablation === type;
          if (!silenced)
            for (const [j, w] of this.outgoing[i])
              this.queue[(this.cursor + 18) % 19][j] += w;
        }
      }
      this.cursor = (this.cursor + 1) % 19;
    }
    for (const key of ["LC4", "LPLC2", "DNp01"] as const)
      this.rates[key] = counts[key] / population[key] / 0.02;
    this.activity.forEach((v, i) => (this.activity[i] = v * 0.85));
    return this.rates;
  }
}
export type GameEvent = {
  time: number;
  text: string;
  kind: "neutral" | "danger" | "good";
};
export type GameState = {
  time: number;
  price: number;
  collateral: number;
  debt: number;
  reserveETH: number;
  reserveUSD: number;
  hf: number;
  spent: number;
  interventions: number;
  danger: number;
  status: "ready" | "running" | "paused" | "survived" | "liquidated";
  autopilot: boolean;
  ablation: Ablation;
  speed: number;
  scenario: "storm" | "wick" | "calm";
  countdown: number;
  escape: number;
  x: number;
  z: number;
  heading: number;
  rates: Brain["rates"];
  events: GameEvent[];
  prices: number[];
  seed: number;
  target: number;
};
export const POOLS = [
  { name: "SAFE HAVEN", x: -4, z: 1.5, color: "#b5e879", yield: "4.2%" },
  { name: "ETH / USDC", x: 2, z: -3.3, color: "#f2c969", yield: "12.8%" },
  { name: "DEGEN GROVE", x: 4, z: 2.5, color: "#e99377", yield: "38.4%" },
];
export function initialState(seed = 42): GameState {
  return {
    time: 0,
    price: 2000,
    collateral: 5,
    debt: 7000,
    reserveETH: 5,
    reserveUSD: 2000,
    hf: 7800 / 7000,
    spent: 0,
    interventions: 0,
    danger: 0,
    status: "ready",
    autopilot: true,
    ablation: "none",
    speed: 1,
    scenario: "storm",
    countdown: 5,
    escape: 0,
    x: 0,
    z: 0,
    heading: 0,
    rates: { LC4: 0, LPLC2: 0, DNp01: 0 },
    events: [
      {
        time: 0,
        text: "Specimen ready. Start the market experiment.",
        kind: "neutral",
      },
    ],
    prices: [2000],
    seed,
    target: 1,
  };
}
export class Game {
  state: GameState;
  brain: Brain;
  private lastAction = -10;
  private shock = 0;
  private neuralTicks = 0;
  constructor(
    readonly circuit: Circuit,
    seed = 42,
  ) {
    this.state = initialState(seed);
    this.brain = new Brain(circuit, seed);
  }
  log(text: string, kind: GameEvent["kind"] = "neutral") {
    this.state.events = [
      { time: this.state.time, text, kind },
      ...this.state.events,
    ].slice(0, 35);
  }
  reset() {
    const { ablation, autopilot, scenario, speed, seed } = this.state;
    this.state = {
      ...initialState(seed),
      ablation,
      autopilot,
      scenario,
      speed,
    };
    this.brain = new Brain(this.circuit, seed);
    this.lastAction = -10;
    this.shock = 0;
    this.neuralTicks = 0;
  }
  action(action: "deposit" | "repay", automatic = false) {
    const s = this.state;
    if (s.status !== "running") return false;
    if (action === "deposit") {
      if (s.reserveETH < 0.5) return false;
      s.reserveETH -= 0.5;
      s.collateral += 0.5;
      s.spent += 0.5 * s.price;
    } else {
      const amount = Math.min(350, s.debt, s.reserveUSD);
      if (amount <= 0) return false;
      s.reserveUSD -= amount;
      s.debt -= amount;
      s.spent += amount;
    }
    s.interventions++;
    this.lastAction = s.time;
    this.updateHF();
    this.log(
      `${automatic ? "Neural pilot" : "You"}: ${action === "deposit" ? "+0.50 vETH collateral" : "repaid vUSD debt"}.`,
      "good",
    );
    return true;
  }
  crash() {
    if (this.state.status !== "running") return;
    this.shock += 0.08;
    this.log("Market shock: ETH −8%. Looming threat injected.", "danger");
  }
  updateHF() {
    const s = this.state;
    s.hf = s.debt === 0 ? 10 : (s.collateral * s.price * 0.78) / s.debt;
  }
  tick() {
    const s = this.state;
    if (s.status !== "running") return;
    s.time = Math.min(180, s.time + 0.1);
    const t = s.time;
    const fall =
      s.scenario === "storm"
        ? (0.32 * t) / 180
        : s.scenario === "wick"
          ? 0.18 * Math.exp(-(((t - 85) / 25) ** 2))
          : (0.015 * t) / 180;
    s.price =
      2000 *
      Math.max(
        0.25,
        1 -
          fall -
          this.shock +
          0.007 * Math.sin(t / 4) +
          0.003 * Math.sin(t * 0.7),
      );
    this.updateHF();
    s.danger = Math.max(0, Math.min(1, (1.22 - s.hf) / 0.25));
    s.rates = { ...this.brain.step(s.danger, s.ablation) };
    const fleeing = s.rates.DNp01 > 10;
    s.escape = fleeing ? Math.min(1, s.escape + 0.3) : s.escape * 0.88;
    if (s.autopilot && fleeing && s.hf < 1.18 && t - this.lastAction >= 4) {
      if (!this.action("deposit", true)) this.action("repay", true);
    }
    const pool = POOLS[s.escape > 0.2 ? 0 : s.target];
    const dx = pool.x - s.x,
      dz = pool.z - s.z;
    if (Math.hypot(dx, dz) > 0.45) {
      s.heading = Math.atan2(-dz, dx);
      const step = Math.min(
        Math.hypot(dx, dz),
        0.1 * (s.escape > 0.2 ? 2 : 0.65),
      );
      const distance = Math.hypot(dx, dz);
      s.x += (dx / distance) * step;
      s.z += (dz / distance) * step;
    }
    s.countdown = s.hf < 1 ? s.countdown - 0.1 : 5;
    if (++this.neuralTicks % 10 === 0)
      s.prices = [...s.prices, s.price].slice(-180);
    if (s.countdown <= 0) {
      s.status = "liquidated";
      this.log(
        "Liquidated. Replay the same market with the circuit intact.",
        "danger",
      );
    } else if (s.time >= 180) {
      s.status = "survived";
      this.log("Storm survived. Your experiment is ready to export.", "good");
    }
  }
}
