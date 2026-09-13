# REKT FLY

A 3D DeFi survival experiment for ETHOnline 2026. A real, reduced FlyWire escape circuit responds to market danger while a NeuroMechFly anatomical model explores a small arena.

## Run

```bash
npm --prefix web ci
npm run dev
```

Open http://localhost:3000. No API keys, wallet, database, GPU or paid service is required for the browser game.

```bash
npm test
npm run lint
npm run build
```

For Vercel, use **web** as the project root. This is a standard Next.js App Router app. It has not been published by this build.

## Play

1. Press play. The practice storm lasts three minutes; 4× speed is available.
2. Watch health factor: collateral × simulated ETH price × 0.78 / debt.
3. Add 0.50 vETH collateral or repay up to 350 vUSD. Reserves are finite.
4. Neural pilot uses simulated DNp01 firing as the input to an explicit game protection rule.
5. Reset, silence both visual outputs, and replay the same seed to compare.
6. Drag either 3D view to orbit. Select **Specimen** for a close-up. Export saves a JSON snapshot, event log and price history.

The arena's food-pool yields are illustrative labels, not accruing DeFi positions. Pool selection controls a designed foraging target. The fly's escape target is controlled by the neural readout. The browser gait and navigation are kinematic, not a full physics simulation.

## What is real, what is modeled

| Component | Implemented scope |
|---|---|
| Fly anatomy | Apache-2.0 NeuroMechFly STL meshes, original rigging and neutral pose, converted to GLB |
| Neural wiring | 316 actual v783 neurons: 104 LC4, 210 LPLC2, 2 DNp01; 10,711 recorded connections |
| Background brain cloud | Sampled anatomical annotation coordinates; these background cells are not simulated |
| Neural dynamics | Original reduced LIF implementation with published Shiu parameters, explicit 0.1 ms Euler timestep and delayed signed synapses |
| Time mapping | 20 ms neural time for each 100 ms of game time; not real-time whole-brain emulation |
| Body animation | Original kinematic browser animation; not inferred leg torques from the connectome |
| Financial actions | Local virtual practice balances; no wallet transactions |
| Modal | Verified bounded CPU articulation benchmark; not connected to the live browser body |
| Chainlink/CRE | Planned integration, not implemented; this build is not yet an eligible completed Chainlink challenge submission |

FlyWire FAFB lacks the full ventral nerve cord leg/wing motor system. A designed locomotion controller is needed before integrating closed-loop MuJoCo movement. We do not claim validated biological behavior, consciousness, financial alpha, or whole-brain equivalence.

The practice game includes a five-second liquidation grace period and custom capital limits. It does not reproduce the official Chainlink challenge contract exactly. The practice policy is public and is not confidential execution.

## Small codebase (YAGNI)

```text
web/src/lib/simulation.ts       Reduced LIF model + deterministic practice game
web/src/components/World.tsx    Three.js arena, anatomical model and orbit camera
web/src/components/BrainView.tsx Sampled anatomy + live circuit activity
web/src/components/Laboratory.tsx Controls, telemetry, guide and export
web/public/data/                Committed browser data + provenance
web/public/models/              Committed GLB + provenance
scripts/                        Reproducible asset/data preparation
simulation/benchmark.py         Bounded Modal CPU physics smoke test
tests/simulation.test.ts        Circuit, accounting and replay tests
```

Direct Three.js avoids adding a second scene framework. React renders controls at 10 Hz; Three.js renders independently. There is no global-state library, auth layer, ORM, queue, agent framework, token contract or paid LLM dependency.

## Rebuild the assets

The small final assets are committed. Rebuilding is only necessary when changing the dataset/mesh pipeline. The downloads are roughly 140 MB, plus mesh assets. They are public, pinned and kept out of git.

```bash
python3 -m venv .venv
.venv/bin/pip install -r scripts/requirements.txt
python3 scripts/fetch_assets.py
.venv/bin/python scripts/prepare_data.py
.venv/bin/python scripts/prepare_fly.py
```

The fetcher verifies SHA-256 hashes for the annotation and connectivity sources. `web/public/data/provenance.json` records those hashes, commits and transformations. The connectivity is a preprocessed v783 derivative from the MIT reference-model repository; the later v783 annotations come from a separately pinned annotation repository. This is not an independently reconstructed canonical Codex export.

## Modal physics check

With the existing authenticated Modal CLI and downloaded assets:

```bash
modal run simulation/benchmark.py
```

Runs one bounded, CPU-only, 2,000-step invocation. It stops when finished; it does not deploy an endpoint or hold a GPU warm. Results are written to `docs/physics-benchmark.json`. The tested model is an attached/tethered articulated fly, without a locomotion controller or brain. It verifies runtime/model loading, finite state and absence of numerical warnings. Its timing must not be advertised as interactive full-body game throughput.

## Verification from this build

- Production Next.js build and ESLint passed.
- Seven tests cover real data integrity, silence without stimulus, intact versus ablated escape output, reserve accounting, deterministic reset, terminal states, and a complete intact-versus-ablated practice storm.
- Full practice storm, seed 42: intact neural pilot survived at 180s with six interventions; both visual outputs silenced liquidated at 64.5s with zero interventions. This is a game/model result, not a wet-lab claim.
- Browser checked: anatomical close-up, 3D scene, start/pause, manual collateral and repayment, and 390px responsive layout.
- Modal CPU benchmark: 56 bodies, 87 degrees of freedom, 2,000 steps, finite state and no numerical warnings. See the JSON for measured timing and its scope.

## Next vertical slice

Connect a tested locomotion controller to MuJoCo on Modal and stream poses into the existing Three.js scene. Keep the kinematic practice mode available with an explicit label. Then integrate the official Sepolia lending contract and a confidential CRE protection workflow. Those are distinct, unfinished milestones; no mainnet funds or OpenAI credentials are needed for the current build.

## Attribution

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [the research report](docs/FLY_PROJECT_RESEARCH.md). Original application code is MIT; imported assets and data retain their own terms.
